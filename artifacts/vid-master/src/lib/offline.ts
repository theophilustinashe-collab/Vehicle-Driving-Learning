/**
 * Utility for handling offline data caching
 */

const CACHE_KEYS = {
  QUESTIONS: 'vid_cached_questions',
  SIGNS: 'vid_cached_signs',
  LAST_SYNC: 'vid_last_sync'
};

export const syncOfflineData = async (questions: any[], signs: any[]) => {
  localStorage.setItem(CACHE_KEYS.QUESTIONS, JSON.stringify(questions));
  localStorage.setItem(CACHE_KEYS.SIGNS, JSON.stringify(signs));
  localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
};

export const getOfflineQuestions = () => {
  const data = localStorage.getItem(CACHE_KEYS.QUESTIONS);
  return data ? JSON.parse(data) : [];
};

export const getOfflineSigns = () => {
  const data = localStorage.getItem(CACHE_KEYS.SIGNS);
  return data ? JSON.parse(data) : [];
};

export const isOfflineDataAvailable = () => {
  return !!localStorage.getItem(CACHE_KEYS.QUESTIONS);
};
