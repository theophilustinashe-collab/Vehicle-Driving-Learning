/**
 * Centralized configuration for Roadify
 * Pure Cloud / HTTPS API Architecture with Environment Variable Support
 */

export const CONFIG = {
  // Hosted Production Endpoints (Overridable by ENV)
  PROD_API_URL: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
                (import.meta?.env?.VITE_API_URL) ||
                'https://bhsubgivjtyeexgkbpxg.supabase.co',

  PROD_WEB_URL: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_WEB_URL) ||
                (import.meta?.env?.VITE_WEB_URL) ||
                'https://roadify-app.vercel.app',

  API_PORT: '8080',
  WEB_PORT: '3001',
  OFFLINE_SYNC_ENABLED: true,
};

export const getApiUrl = (isNative: boolean = false) => {
  // Priority 1: Explicit Environment Variable (Highest Priority for Cloud APK / EAS Build)
  const envApiUrl = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
                     (import.meta?.env?.VITE_API_URL);
  if (envApiUrl) return envApiUrl;

  // Priority 2: User-set cloud override in localStorage
  const forceCloud = typeof window !== 'undefined' && localStorage.getItem('vid_force_cloud') === 'true';
  if (forceCloud) return CONFIG.PROD_API_URL;

  // Priority 3: User-set custom IP override (for local debugging)
  const manualIp = typeof window !== 'undefined' ? localStorage.getItem('vid_custom_ip') : null;
  if (manualIp) return `http://${manualIp}:${CONFIG.API_PORT}`;

  // Priority 4: Web Browser environment - use relative path so Vite proxy / same-origin works seamlessly
  if (typeof window !== 'undefined' && !isNative) {
    return "";
  }

  // Priority 5: Default to Cloud Production HTTPS API for 100% laptop-independent APK
  return CONFIG.PROD_API_URL;
};

export const getWebUrl = () => {
  const envWebUrl = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_WEB_URL) ||
                     (import.meta?.env?.VITE_WEB_URL);
  if (envWebUrl) return envWebUrl;

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return CONFIG.PROD_WEB_URL;
};
