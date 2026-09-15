/**
 * Bridge for secure token storage between Web and Native
 */

const isNative = typeof window !== 'undefined' && (window as any).ReactNativeWebView;

// Memory cache for faster access and fallback
let tokenCache: string | null = null;
try {
  tokenCache = typeof window !== 'undefined' ? localStorage.getItem('vid_token') : null;
} catch (e) {
  console.warn("Storage access warning", e);
}

export const setSecureToken = (token: string | null) => {
  tokenCache = token;

  if (isNative) {
    try {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({
        type: 'SET_AUTH_TOKEN',
        token
      }));
    } catch (e) {}
  }

  try {
    if (token) {
      localStorage.setItem('vid_token', token);
    } else {
      localStorage.removeItem('vid_token');
    }
  } catch (e) {}
};

export const getSecureToken = (): string | null => {
  if (tokenCache) return tokenCache;
  try {
    return typeof window !== 'undefined' ? localStorage.getItem('vid_token') : null;
  } catch (e) {
    return null;
  }
};

// Sync bridge on startup
if (isNative) {
  const handleAuthSync = (event: any) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'AUTH_TOKEN_RESPONSE' && data.token) {
        console.log("[Roadify] Auth token synced from Native SecureStore");
        tokenCache = data.token;
        try {
          localStorage.setItem('vid_token', data.token);
        } catch (e) {}
      }
    } catch (e) {}
  };

  window.addEventListener('message', handleAuthSync);

  try {
    (window as any).ReactNativeWebView.postMessage(JSON.stringify({
      type: 'GET_AUTH_TOKEN'
    }));
  } catch (e) {}
}
