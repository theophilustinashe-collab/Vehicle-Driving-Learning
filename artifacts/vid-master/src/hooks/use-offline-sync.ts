import { useEffect, useRef } from 'react';
import { useListQuestions, useListSigns, useSubmitTest } from '@roadify/api-client-react';
import { syncOfflineData, getPendingResults, clearPendingResults } from '@/lib/offline';
import { useToast } from './use-toast';

export function useOfflineSync() {
  const { data: questions } = useListQuestions();
  const { data: signs } = useListSigns();
  const submitTest = useSubmitTest();
  const { toast } = useToast();
  const isSyncingResults = useRef(false);

  // Sync Content (Questions/Signs)
  useEffect(() => {
    if (questions && signs) {
      console.log("[Roadify] Syncing data for offline use...");
      syncOfflineData(questions, signs);
    }
  }, [questions, signs]);

  // Sync Pending Results
  useEffect(() => {
    const syncResults = async () => {
      if (isSyncingResults.current || !navigator.onLine) return;

      const pending = getPendingResults();
      if (pending.length === 0) return;

      isSyncingResults.current = true;
      console.log(`[Roadify] Found ${pending.length} pending results to sync...`);

      let successCount = 0;

      for (const result of pending) {
        try {
          // If it was a truly offline session, we might need to create a session on the server first,
          // but if the API allows submitting directly with a payload, we use that.
          // For now, we assume the API expects sessionId + answers.
          await submitTest.mutateAsync({
            sessionId: result.sessionId,
            data: { answers: result.answers }
          });
          successCount++;
        } catch (e) {
          console.error(`Failed to sync result ${result.sessionId}`, e);
        }
      }

      if (successCount > 0) {
        toast({
          title: "Sync Complete",
          description: `Successfully uploaded ${successCount} offline test results.`
        });
        clearPendingResults();
      }

      isSyncingResults.current = false;
    };

    const timer = setInterval(syncResults, 30000); // Check every 30s
    syncResults(); // Initial check

    return () => clearInterval(timer);
  }, [navigator.onLine]);
}
