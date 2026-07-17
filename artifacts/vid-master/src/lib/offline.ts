/**
 * Utility for handling offline data caching
 */

const CACHE_KEYS = {
  QUESTIONS: 'vid_cached_questions',
  SIGNS: 'vid_cached_signs',
  LAST_SYNC: 'vid_last_sync',
  RESULT_QUEUE: 'vid_pending_results'
};

export const syncOfflineData = async (questions: any[], signs: any[]) => {
  try {
    localStorage.setItem(CACHE_KEYS.QUESTIONS, JSON.stringify(questions));
    localStorage.setItem(CACHE_KEYS.SIGNS, JSON.stringify(signs));
    localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
    return true;
  } catch (e) {
    console.error("Failed to save offline data", e);
    return false;
  }
};

// --- RESULT QUEUE ---

export const queueTestResult = (sessionId: string, score: number, total: number, answers: any[]) => {
  try {
    const queue = getPendingResults();
    const result = {
      sessionId,
      score,
      total,
      answers,
      percentage: Math.round((score / total) * 100),
      passed: score >= (total * 0.88),
      completedAt: new Date().toISOString(),
      queuedAt: new Date().toISOString()
    };

    queue.push(result);
    localStorage.setItem(CACHE_KEYS.RESULT_QUEUE, JSON.stringify(queue));
    return true;
  } catch (e) {
    console.error("Failed to queue result", e);
    return false;
  }
};

export const getPendingResults = (): any[] => {
  const data = localStorage.getItem(CACHE_KEYS.RESULT_QUEUE);
  return data ? JSON.parse(data) : [];
};

export const clearPendingResults = () => {
  localStorage.removeItem(CACHE_KEYS.RESULT_QUEUE);
};

export const getOfflineQuestions = () => {
  const data = localStorage.getItem(CACHE_KEYS.QUESTIONS);
  return data ? JSON.parse(data) : [];
};

export const getOfflineSigns = () => {
  const data = localStorage.getItem(CACHE_KEYS.SIGNS);
  return data ? JSON.parse(data) : [];
};

export const getLastSyncDate = () => {
  return localStorage.getItem(CACHE_KEYS.LAST_SYNC);
};

export const isOfflineDataAvailable = () => {
  const q = localStorage.getItem(CACHE_KEYS.QUESTIONS);
  const s = localStorage.getItem(CACHE_KEYS.SIGNS);
  return !!q && !!s;
};
