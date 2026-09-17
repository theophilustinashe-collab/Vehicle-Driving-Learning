import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vidmaster.zim',
  appName: 'VID Master',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;
