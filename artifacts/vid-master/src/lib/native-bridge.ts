/**
 * Native Bridge Utilities for Roadify Hybrid App
 */

const isNative = typeof window !== 'undefined' && (window as any).ReactNativeWebView;

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

/**
 * Trigger haptic feedback on the device
 */
export const triggerHaptic = (style: HapticStyle = 'selection') => {
  if (isNative) {
    (window as any).ReactNativeWebView.postMessage(JSON.stringify({
      type: 'HAPTIC_FEEDBACK',
      style
    }));
  }
};

/**
 * Request device location via native bridge
 */
export const requestNativeLocation = () => {
  if (isNative) {
    (window as any).ReactNativeWebView.postMessage(JSON.stringify({
      type: 'REQUEST_LOCATION'
    }));
  }
};

/**
 * Use native speech engine
 */
export const nativeSpeak = (text: string, options?: any) => {
  if (isNative) {
    (window as any).ReactNativeWebView.postMessage(JSON.stringify({
      type: 'SPEAK',
      text,
      options
    }));
    return true;
  }
  return false;
};

export const nativeStopSpeaking = () => {
  if (isNative) {
    (window as any).ReactNativeWebView.postMessage(JSON.stringify({
      type: 'STOP_SPEAKING'
    }));
  }
};

/**
 * Listen for theme changes from the native shell
 */
export const onNativeThemeChange = (callback: (theme: 'light' | 'dark') => void) => {
  if (!isNative) return () => {};

  const handler = (event: any) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'THEME_SYNC') {
        callback(data.theme);
      }
    } catch (e) {}
  };

  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
};
