import { registerRootComponent } from 'expo';
import Constants from 'expo-constants';
import React, { useState, useEffect } from 'react';
import { StyleSheet, StatusBar, View, Text, Button, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

function App() {
  const [error, setError] = useState(null);
  const [key, setKey] = useState(0);

  // If we are on web, show a message instead of crashing
  if (Platform.OS === 'web') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Native App Only</Text>
        <Text style={styles.errorText}>The WebView shell is designed for Android/iOS.</Text>
        <Text style={styles.hint}>Please open this project using the Expo Go app on your phone.</Text>
      </View>
    );
  }

  // Default fallback to your known IP
  const hardcodedIp = '192.168.1.63';
  const renderUrl = 'https://vid-master-web.onrender.com'; // Your production URL

  // Detect the IP address Expo is currently using
  const expoIp = Constants.expoConfig?.hostUri?.split(':')[0] ||
                 Constants.manifest2?.extra?.expoGo?.debuggerHost?.split(':')[0] ||
                 Constants.manifest?.debuggerHost?.split(':')[0];

  const ipToUse = (expoIp && expoIp !== 'localhost' && expoIp !== '127.0.0.1') ? expoIp : hardcodedIp;

  // You can change this if your dev server runs on a different port
  const devPort = 3001;

  // Use Render URL in production, Local IP in development
  const devServerUrl = __DEV__ ? `http://${ipToUse}:${devPort}` : renderUrl;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorText}>Target: {devServerUrl}</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Button title="Try Again" onPress={() => { setError(null); setKey(k => k + 1); }} />
            <Text style={styles.hint}>1. Ensure 'pnpm dev' is running on your PC.</Text>
            <Text style={styles.hint}>2. Check that phone & PC are on the SAME Wi-Fi.</Text>
          </View>
        ) : (
          <WebView
            key={key}
            source={{ uri: devServerUrl }}
            style={styles.webview}
            onError={(e) => setError(e.nativeEvent.description)}
            onHttpError={(e) => setError(`HTTP Error: ${e.nativeEvent.statusCode}`)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            originWhitelist={['*']}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webview: { flex: 1 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  errorTitle: { fontSize: 22, fontWeight: 'bold', color: '#ef4444', marginBottom: 10 },
  errorText: { fontSize: 16, color: '#334155', marginBottom: 5, fontWeight: '600' },
  errorMessage: { fontSize: 14, color: '#64748b', marginBottom: 30, textAlign: 'center', backgroundColor: '#f1f5f9', padding: 10, borderRadius: 8 },
  hint: { fontSize: 13, color: '#94a3b8', marginTop: 8, textAlign: 'center' }
});

registerRootComponent(App);
