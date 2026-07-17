/**
 * Centralized configuration for Roadify
 * Update your PC's IP address here to sync both Web and Native apps.
 */

export const CONFIG = {
  // 1. CHANGE THIS to your PC's current IP address (from ipconfig)
  DEV_PC_IP: '192.168.1.63',

  // 2. Ports
  API_PORT: '8080',
  WEB_PORT: '3001',

  // 3. Production URLs
  PROD_API_URL: 'https://vehicle-driving-learning-api-3.onrender.com',
  PROD_WEB_URL: 'https://vehicle-driving-learning-3.onrender.com',

  // 4. Feature Flags
  OFFLINE_SYNC_ENABLED: true,
  STRICT_SECURE_STORAGE: false, // Set to true once SecureStore bridge is active
};

export const getApiUrl = (isNative: boolean = false) => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return CONFIG.PROD_API_URL;
  }

  if (isNative) {
    return `http://${CONFIG.DEV_PC_IP}:${CONFIG.API_PORT}`;
  }

  return `http://localhost:${CONFIG.API_PORT}`;
};

export const getWebUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return CONFIG.PROD_WEB_URL;
  }
  return `http://localhost:${CONFIG.WEB_PORT}`;
};
