import { useEffect } from 'react';
import { useGetQuestions, useGetSigns } from '@workspace/api-client-react';
import { syncOfflineData } from '@/lib/offline';

export function useOfflineSync() {
  const { data: questions } = useGetQuestions();
  const { data: signs } = useGetSigns();

  useEffect(() => {
    if (questions && signs) {
      console.log("[Roadify] Syncing data for offline use...");
      syncOfflineData(questions, signs);
    }
  }, [questions, signs]);
}
