import { registerRootComponent } from 'expo';
import Constants from 'expo-constants';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, StatusBar, View, Text, Button, Platform, BackHandler, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

function AppContent() {
  const [error, setError] = useState(null);
  const [key, setKey] = useState(0);
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

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
      const data = JSON.parse(event.nativeEvent.data);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorText}>Target: {serverUrl}</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button title="Try Again" onPress={() => { setError(null); setKey(k => k + 1); }} />
          <Text style={styles.hint}>1. Ensure 'pnpm dev' is running on your PC.</Text>
          <Text style={styles.hint}>2. Check that phone & PC are on the SAME Wi-Fi.</Text>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          key={key}
          source={{ uri: serverUrl }}
          style={styles.webview}
          onMessage={handleMessage}
          onError={(e) => setError(e.nativeEvent.description)}
          onHttpError={(e) => setError(`HTTP Error: ${e.nativeEvent.statusCode}`)}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          originWhitelist={['*']}
          geolocationEnabled={true}
          onGeolocationPermissionsShowPrompt={(event) => {
            // Automatically allow geolocation permission inside the WebView
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
        <Text style={styles.errorTitle}>Native App Only</Text>
        <Text style={styles.errorText}>The WebView shell is designed for Android/iOS.</Text>
        <Text style={styles.hint}>Please open this project using the Expo Go app on your phone.</Text>
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
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  errorTitle: { fontSize: 22, fontWeight: 'bold', color: '#ef4444', marginBottom: 10 },
  errorText: { fontSize: 16, color: '#334155', marginBottom: 5, fontWeight: '600' },
  errorMessage: { fontSize: 14, color: '#64748b', marginBottom: 30, textAlign: 'center', backgroundColor: '#f1f5f9', padding: 10, borderRadius: 8 },
  hint: { fontSize: 13, color: '#94a3b8', marginTop: 8, textAlign: 'center' }
});

registerRootComponent(App);
