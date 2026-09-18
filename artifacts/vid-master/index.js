import { registerRootComponent } from 'expo';
import Constants from 'expo-constants';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, StatusBar, View, Text, Button, Platform, BackHandler, ActivityIndicator, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

// Unified Render Production Web + API Server Endpoint
const PROD_API_URL = process.env.EXPO_PUBLIC_API_URL ||
                      Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
                      'https://vehicle-driving-learning-4.onrender.com';

function AppContent() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasBootedRef = useRef(false);
  const [key, setKey] = useState(0);
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const colorScheme = useColorScheme();

  // Target live Render endpoint for Expo Go and Mobile WebViews
  const targetUrl = process.env.EXPO_PUBLIC_WEB_DEV_URL || PROD_API_URL;

  const webViewSource = { uri: targetUrl };

  console.log('[Roadify Native] WebView Source URI:', targetUrl);

  // Safety Timer: Guarantee loading overlay clears after 1.2s max
  useEffect(() => {
    const timer = setTimeout(() => {
      hasBootedRef.current = true;
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [key]);

  const handleLoadStart = () => {
    if (!hasBootedRef.current) {
      setIsLoading(true);
    }
  };

  const handleLoadEnd = () => {
    hasBootedRef.current = true;
    setIsLoading(false);
  };

  // Health Handshake with Render Backend API
  useEffect(() => {
    let isMounted = true;
    fetch(`${PROD_API_URL}/api/health`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          console.log("[Roadify Native] Render API Health Verified:", data);
        }
      })
      .catch(err => {
        console.warn("[Roadify Native] Render API Health warning:", err);
      });
    return () => { isMounted = false; };
  }, []);

  // Sync theme with Web
  useEffect(() => {
    if (webViewRef.current) {
      try {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'THEME_SYNC',
          theme: colorScheme
        }));
      } catch (e) {}
    }
  }, [colorScheme]);

  // Handle hardware back button on Android safely
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    let subscription = null;
    try {
      if (typeof BackHandler.addEventListener === 'function') {
        subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      }
    } catch (e) {
      console.warn("BackHandler error:", e);
    }

    return () => {
      try {
        if (subscription && typeof subscription.remove === 'function') {
          subscription.remove();
        } else if (typeof BackHandler.removeEventListener === 'function') {
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }
      } catch (e) {
        console.warn("BackHandler cleanup error:", e);
      }
    };
  }, [canGoBack]);

  // NATIVE BRIDGE HANDLER
  const handleMessage = async (event) => {
    try {
      const msgData = event.nativeEvent?.data;
      if (typeof msgData !== 'string') return;

      let data;
      try {
        data = JSON.parse(msgData);
      } catch (e) {
        return;
      }

      // Haptic Feedback Bridge
      if (data.type === 'HAPTIC_FEEDBACK') {
        try {
          if (Haptics && typeof Haptics.selectionAsync === 'function') {
            switch (data.style) {
              case 'light': Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Light || 'light'); break;
              case 'medium': Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Medium || 'medium'); break;
              case 'heavy': Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy || 'heavy'); break;
              case 'success': Haptics.notificationAsync?.(Haptics.NotificationFeedbackType?.Success || 'success'); break;
              case 'warning': Haptics.notificationAsync?.(Haptics.NotificationFeedbackType?.Warning || 'warning'); break;
              case 'error': Haptics.notificationAsync?.(Haptics.NotificationFeedbackType?.Error || 'error'); break;
              default: Haptics.selectionAsync();
            }
          }
        } catch (e) {}
      }

      // Native Speech Bridge
      if (data.type === 'SPEAK') {
        try {
          if (Speech && typeof Speech.speak === 'function') {
            Speech.stop?.();
            Speech.speak(data.text, {
              language: data.options?.language || 'en-GB',
              pitch: data.options?.pitch || 1.05,
              rate: data.options?.rate || 0.82,
            });
          }
        } catch (e) {}
      }

      if (data.type === 'STOP_SPEAKING') {
        try {
          Speech?.stop?.();
        } catch (e) {}
      }

      // Auth Management with Safe Fallback
      if (data.type === 'SET_AUTH_TOKEN') {
        try {
          if (SecureStore && typeof SecureStore.setItemAsync === 'function') {
            if (data.token) {
              await SecureStore.setItemAsync('vid_token', data.token);
            } else {
              await SecureStore.deleteItemAsync('vid_token');
            }
          }
        } catch (e) {
          console.warn("SecureStore set error:", e);
        }
      }

      if (data.type === 'GET_AUTH_TOKEN') {
        try {
          let token = null;
          if (SecureStore && typeof SecureStore.getItemAsync === 'function') {
            token = await SecureStore.getItemAsync('vid_token');
          }
          webViewRef.current?.postMessage(JSON.stringify({
            type: 'AUTH_TOKEN_RESPONSE',
            token: token
          }));
        } catch (e) {
          console.warn("SecureStore get error:", e);
          webViewRef.current?.postMessage(JSON.stringify({
            type: 'AUTH_TOKEN_RESPONSE',
            token: null
          }));
        }
      }
    } catch (e) {
      console.warn("Bridge Error:", e);
    }
  };

  const handleWebError = (e) => {
    const nativeEvt = e.nativeEvent || {};
    const code = nativeEvt.code ?? -1;
    const desc = nativeEvt.description || 'WebView Load Error';
    const failingUrl = nativeEvt.url || targetUrl;
    const domain = nativeEvt.domain || 'render-api';

    console.warn(`[Roadify WebView Load Warning] Code: ${code}, Domain: ${domain}, Description: ${desc}, URL: ${failingUrl}`);
    hasBootedRef.current = true;
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {isLoading && !error && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>ROADIFY</Text>
          <Text style={styles.loadingSubtext}>Connecting to Render Engine...</Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorText}>Unable to reach the Roadify Render engine.</Text>
          <View style={styles.errorBox}>
             <Text style={styles.errorLabel}>Render Endpoint:</Text>
             <Text style={styles.errorValue}>{PROD_API_URL}</Text>
          </View>
          <Button title="Retry Handshake" color="#4f46e5" onPress={() => { setError(null); setIsLoading(true); setKey(k => k + 1); }} />
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          key={key}
          source={webViewSource}
          style={styles.webview}
          onMessage={handleMessage}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleWebError}
          onHttpError={handleWebError}
          renderError={() => (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Roadify Master</Text>
              <Text style={styles.errorText}>Initializing Highway Code Engine...</Text>
              <View style={styles.errorBox}>
                 <Text style={styles.errorLabel}>Render API Target:</Text>
                 <Text style={styles.errorValue}>{PROD_API_URL}</Text>
              </View>
              <Button title="Reload Application" color="#4f46e5" onPress={() => setKey(k => k + 1)} />
            </View>
          )}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          originWhitelist={['*']}
          allowsBackForwardNavigationGestures={true}
          pullToRefreshEnabled={true}
          geolocationEnabled={true}
          mixedContentMode="always"
        />
      )}
    </SafeAreaView>
  );
}

class NativeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[Roadify Native Error Caught]:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Roadify</Text>
          <Text style={styles.errorText}>A temporary error occurred. Tap below to reload.</Text>
          <Button title="Reload Application" color="#4f46e5" onPress={() => this.setState({ hasError: false })} />
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <NativeErrorBoundary>
        <AppContent />
      </NativeErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  webview: { flex: 1, backgroundColor: '#020617' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020617',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
    marginTop: 20
  },
  loadingSubtext: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  devUrl: {
    position: 'absolute',
    bottom: 40,
    fontSize: 10,
    color: 'rgba(255,255,255,0.1)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#020617'
  },
  errorTitle: { fontSize: 24, fontWeight: '900', color: '#ef4444', marginBottom: 10 },
  errorText: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 30 },
  errorBox: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 15, width: '100%', marginBottom: 30 },
  errorLabel: { fontSize: 10, fontWeight: 'bold', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' },
  errorValue: { fontSize: 12, color: '#fff', marginTop: 5, fontWeight: 'bold' },
});

registerRootComponent(App);
