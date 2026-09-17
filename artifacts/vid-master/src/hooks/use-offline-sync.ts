import { useEffect, useRef } from 'react';
import { useListQuestions, useListSigns, useSubmitTest } from '@roadify/api-client-react';
import { syncOfflineData, getPendingResults, removeSyncedResult } from '@/lib/offline';
import { useToast } from './use-toast';

export function useOfflineSync(user: any) {
  // Always pre-fetch content for offline use whenever online
  const { data: questions } = useListQuestions({ limit: 1000 }, {
    query: {
      staleTime: 1000 * 60 * 60, // 1 hour stale time for offline sync
      refetchInterval: 1000 * 60 * 30, // Background sync every 30 mins
      retry: 2,
    } as any
  });

  const { data: signs } = useListSigns({}, {
    query: {
      staleTime: Infinity,
      retry: 2,
    } as any
  });

  const submitTest = useSubmitTest();
  const { toast } = useToast();
  const isSyncingResults = useRef(false);

  // Sync Content (Questions/Signs)
  useEffect(() => {
    if (questions && Array.isArray(questions) && questions.length > 0) {
      console.log(`[Roadify Offline] Caching ${questions.length} questions and ${signs?.length || 0} signs for offline use...`);
      syncOfflineData(questions, signs || []);
    }
  }, [questions, signs]);

  // Sync Pending Results Queue
  useEffect(() => {
    const syncResults = async () => {
      if (isSyncingResults.current || !navigator.onLine) return;

      const pending = getPendingResults();
      if (pending.length === 0) return;

      isSyncingResults.current = true;
      console.log(`[Roadify Offline Sync] Processing ${pending.length} queued offline results...`);

      let successCount = 0;
      const syncedIds: string[] = [];

      for (const result of pending) {
        try {
          await submitTest.mutateAsync({
            sessionId: result.sessionId,
            data: { answers: result.answers }
          });
          successCount++;
          syncedIds.push(result.sessionId);
        } catch (e: any) {
          // If the error is "Session already submitted" or 409 conflict, safely mark as synced
          if (e.message?.includes("already submitted") || e.status === 409) {
            syncedIds.push(result.sessionId);
          } else {
            console.error(`[Roadify Offline Sync] Retry scheduled for result ${result.sessionId}:`, e);
          }
        }
      }

      if (syncedIds.length > 0) {
        syncedIds.forEach(id => removeSyncedResult(id));

        if (successCount > 0) {
          toast({
            title: "Offline Sync Complete",
            description: `Successfully synchronized ${successCount} test result(s) to the cloud.`
          });
        }
      }

      isSyncingResults.current = false;
    };

    const timer = setInterval(syncResults, 30000); // Check every 30s
    syncResults(); // Initial check

    return () => clearInterval(timer);
  }, [navigator.onLine]);
}
