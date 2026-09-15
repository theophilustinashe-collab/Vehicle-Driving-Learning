/**
 * Utility for handling offline data caching
 */

const CACHE_KEYS = {
  QUESTIONS: 'vid_cached_questions',
  SIGNS: 'vid_cached_signs',
  LAST_SYNC: 'vid_last_sync',
  RESULT_QUEUE: 'vid_pending_results',
  USER: 'vid_cached_user',
  DASHBOARD: 'vid_cached_dashboard'
};

export const syncOfflineData = async (questions: any[], signs: any[]) => {
  return new Promise((resolve) => {
    // Defer to next tick to avoid blocking UI immediately
    setTimeout(() => {
      try {
        if (!Array.isArray(questions) || !Array.isArray(signs)) {
          throw new Error("Invalid data format for sync");
        }

        localStorage.setItem(CACHE_KEYS.QUESTIONS, JSON.stringify(questions));
        localStorage.setItem(CACHE_KEYS.SIGNS, JSON.stringify(signs));
        localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());

        console.log(`[Offline Sync] Cached ${questions.length} questions and ${signs.length} signs.`);
        resolve(true);
      } catch (e) {
        console.error("Failed to save offline data", e);
        resolve(false);
      }
    }, 100);
  });
};

export const setCachedUser = (user: any) => {
  if (!user) return;
  try {
    localStorage.setItem(CACHE_KEYS.USER, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to cache user", e);
  }
};

export const getCachedUser = () => {
  try {
    const data = localStorage.getItem(CACHE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Corrupted user cache detected", e);
    localStorage.removeItem(CACHE_KEYS.USER);
    return null;
  }
};

export const setCachedDashboard = (data: any) => {
  if (!data) return;
  try {
    localStorage.setItem(CACHE_KEYS.DASHBOARD, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to cache dashboard", e);
  }
};

export const getCachedDashboard = () => {
  try {
    const data = localStorage.getItem(CACHE_KEYS.DASHBOARD);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    localStorage.removeItem(CACHE_KEYS.DASHBOARD);
    return null;
  }
};

export const recordQuestionMistakes = (answers: any[]) => {
  if (!Array.isArray(answers)) return;
  try {
    const incorrectIds = answers.filter(a => a && a.isCorrect === false).map(a => a.questionId);
    if (incorrectIds.length === 0) return;

    const currentMistakes = getRecordedMistakeIds();
    const updatedMistakes = Array.from(new Set([...currentMistakes, ...incorrectIds]));
    localStorage.setItem('vid_user_mistakes', JSON.stringify(updatedMistakes));
  } catch (e) {
    console.error("Failed to record mistakes", e);
  }
};

export const getRecordedMistakeIds = (): number[] => {
  try {
    const data = localStorage.getItem('vid_user_mistakes');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

// --- RESULT QUEUE ---

export const queueTestResult = (sessionId: string, score: number, total: number, answers: any[]) => {
  try {
    // Record real user mistakes for the Mistake Bank
    recordQuestionMistakes(answers);

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
  try {
    const data = localStorage.getItem(CACHE_KEYS.RESULT_QUEUE);
    const results = data ? JSON.parse(data) : [];
    return Array.isArray(results) ? results : [];
  } catch (e) {
    return [];
  }
};

export const removeSyncedResult = (sessionId: string) => {
  try {
    const queue = getPendingResults();
    const filtered = queue.filter(r => r.sessionId !== sessionId);
    localStorage.setItem(CACHE_KEYS.RESULT_QUEUE, JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to remove synced result", e);
  }
};

export const clearPendingResults = () => {
  localStorage.removeItem(CACHE_KEYS.RESULT_QUEUE);
};

export const getOfflineQuestions = () => {
  try {
    const data = localStorage.getItem(CACHE_KEYS.QUESTIONS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const getOfflineSigns = () => {
  try {
    const data = localStorage.getItem(CACHE_KEYS.SIGNS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const getLastSyncDate = () => {
  try {
    return localStorage.getItem(CACHE_KEYS.LAST_SYNC);
  } catch (e) {
    return null;
  }
};

export const isOfflineDataAvailable = () => {
  try {
    const q = localStorage.getItem(CACHE_KEYS.QUESTIONS);
    const s = localStorage.getItem(CACHE_KEYS.SIGNS);
    return !!q && !!s;
  } catch (e) {
    return false;
  }
};

export const clearAllCache = () => {
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('vid_token');
    localStorage.removeItem('vid_force_cloud');
    localStorage.removeItem('vid_custom_ip');
  } catch (e) {}
};
