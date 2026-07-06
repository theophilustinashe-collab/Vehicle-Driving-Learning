import { registerRootComponent } from 'expo';
import Constants from 'expo-constants';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, StatusBar, View, Text, Button, Platform, BackHandler, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

function AppContent() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // Fallback IP for development
  const hardcodedIp = '192.168.1.63';
  const renderUrl = 'https://vehicle-driving-learning.onrender.com';

  // Detect server URL
  const expoIp = Constants.expoConfig?.hostUri?.split(':')[0] ||
                 Constants.manifest2?.extra?.expoGo?.debuggerHost?.split(':')[0] ||
                 Constants.manifest?.debuggerHost?.split(':')[0];

  const ipToUse = (expoIp && expoIp !== 'localhost' && expoIp !== '127.0.0.1') ? expoIp : hardcodedIp;
  const devPort = 3001;
  const serverUrl = __DEV__ ? `http://${ipToUse}:${devPort}` : renderUrl;

  // Handle hardware back button on Android
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [canGoBack]);

  // NATIVE GPS HANDLER (Communication Bridge)
  const handleMessage = async (event) => {
    try {
      const msgData = event.nativeEvent.data;
      if (typeof msgData !== 'string') return;

      let data;
      try {
        data = JSON.parse(msgData);
      } catch (e) {
        return; // Ignore non-JSON
      }

      if (data.type === 'REQUEST_LOCATION') {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          webViewRef.current?.postMessage(JSON.stringify({
            type: 'LOCATION_ERROR',
            message: 'Permission denied by user.'
          }));
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        // Send coordinates back to web view
        webViewRef.current?.postMessage(JSON.stringify({
          type: 'LOCATION_SUCCESS',
          coords: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          }
        }));
      }
    } catch (e) {
      console.warn("Bridge Error:", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {isLoading && !error && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Initializing VID Master...</Text>
          <Text style={styles.loadingSubtext}>Connecting to {serverUrl}</Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorText}>The app couldn't reach the learning server.</Text>
          <View style={styles.errorDetailBox}>
             <Text style={styles.errorDetailLabel}>Target:</Text>
             <Text style={styles.errorDetailText}>{serverUrl}</Text>
          </View>
          <Button title="Refresh Connection" color="#4f46e5" onPress={() => { setError(null); setIsLoading(true); setKey(k => k + 1); }} />

          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>Troubleshooting:</Text>
            <Text style={styles.hintText}>• Ensure your PC is running 'pnpm dev'</Text>
            <Text style={styles.hintText}>• Verify your Phone & PC are on the SAME Wi-Fi</Text>
            <Text style={styles.hintText}>• Check if your PC firewall is blocking port 3001</Text>
          </View>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          key={key}
          source={{ uri: serverUrl }}
          style={styles.webview}
          onMessage={handleMessage}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={(e) => {
            setError(e.nativeEvent.description);
            setIsLoading(false);
          }}
          onHttpError={(e) => {
            setError(`HTTP Error: ${e.nativeEvent.statusCode}`);
            setIsLoading(false);
          }}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          originWhitelist={['*']}
          geolocationEnabled={true}
          onGeolocationPermissionsShowPrompt={(event) => {
            return {
              origin: event.origin,
              allow: true,
              retain: true,
            };
          }}
        />
      )}
    </SafeAreaView>
  );
}

function App() {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Native Shell Only</Text>
        <Text style={styles.errorText}>This wrapper is for Android/iOS devices.</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webview: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 20, fontSize: 18, fontWeight: '900', color: '#0f172a' },
  loadingSubtext: { marginTop: 5, fontSize: 12, color: '#64748b' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  errorTitle: { fontSize: 24, fontWeight: '900', color: '#ef4444', marginBottom: 10 },
  errorText: { fontSize: 16, color: '#334155', textAlign: 'center', marginBottom: 20 },
  errorDetailBox: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, width: '100%', marginBottom: 30, borderWidth: 1, borderColor: '#e2e8f0' },
  errorDetailLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
  errorDetailText: { fontSize: 14, fontWeight: '700', color: '#475569', marginTop: 4 },
  hintBox: { marginTop: 40, width: '100%', padding: 20, backgroundColor: '#f1f5f9', borderRadius: 16 },
  hintTitle: { fontSize: 14, fontWeight: '900', color: '#475569', marginBottom: 10 },
  hintText: { fontSize: 13, color: '#64748b', marginBottom: 5, fontWeight: '600' }
});

registerRootComponent(App);
