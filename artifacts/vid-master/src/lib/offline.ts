/**
 * Utility for handling offline data caching
 */

const CACHE_KEYS = {
  QUESTIONS: 'vid_cached_questions',
  SIGNS: 'vid_cached_signs',
  LAST_SYNC: 'vid_last_sync'
};

export const syncOfflineData = async (questions: any[], signs: any[]) => {
  try {
    // If questions are very large, localStorage might fail.
    // We filter out any huge objects if needed, but for 200 questions it should be fine.
    localStorage.setItem(CACHE_KEYS.QUESTIONS, JSON.stringify(questions));
    localStorage.setItem(CACHE_KEYS.SIGNS, JSON.stringify(signs));
    localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
    return true;
  } catch (e) {
    console.error("Failed to save offline data", e);
    return false;
  }
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
