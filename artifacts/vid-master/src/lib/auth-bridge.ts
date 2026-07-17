/**
 * Bridge for secure token storage between Web and Native
 */

const isNative = typeof window !== 'undefined' && window.ReactNativeWebView;

export const setSecureToken = (token: string | null) => {
  if (isNative) {
    (window as any).ReactNativeWebView.postMessage(JSON.stringify({
      type: 'SET_AUTH_TOKEN',
      token
    }));
  }

  if (token) {
    localStorage.setItem('vid_token', token);
  } else {
    localStorage.removeItem('vid_token');
  }
};

export const getSecureToken = (): string | null => {
  return localStorage.getItem('vid_token');
};

// Sync bridge on startup
if (isNative) {
  window.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'AUTH_TOKEN_RESPONSE' && data.token) {
        localStorage.setItem('vid_token', data.token);
      }
    } catch (e) {}
  });

  (window as any).ReactNativeWebView.postMessage(JSON.stringify({
    type: 'GET_AUTH_TOKEN'
  }));
}
