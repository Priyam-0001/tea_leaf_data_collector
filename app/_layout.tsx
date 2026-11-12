import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import packageJson from '@/package.json';
import { getDatabase } from '@/database/connection';
import { useLocationCapture } from '@/hooks/useLocation';
import { useAuthStore } from '@/store/authStore';
import { useDeviceStore } from '@/store/deviceStore';

const C = {
  navy: '#0D1F3C',
  navyMid: '#1E3A5F',
  gold: '#E5A820',
  page: '#F0F5FF',
  textMuted: '#7A90B8',
  card: '#FFFFFF',
  danger: '#DC2626',
};

function LoadingSplash() {
  const pulseAnim = useRef(new Animated.Value(0.92)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Gentle logo breathing pulse
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [fadeAnim, pulseAnim]);

  return (
    <View style={styles.splashContainer}>
      <Animated.View
        style={[
          styles.splashContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <View style={styles.logoRing}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.instituteText}>Tocklai Tea Research Institute</Text>
        <Text style={styles.appTitle}>Tocklai Field</Text>
        <Text style={styles.subtitle}>Welcome to Field Research Companion</Text>

        <View style={styles.loaderRow}>
          <ActivityIndicator size="small" color={C.gold} />
          <Text style={styles.initializingText}>Initializing local database…</Text>
        </View>
      </Animated.View>

      <View style={styles.splashFooter}>
        <Text style={styles.versionTag}>v {packageJson.version}</Text>
        <Text style={styles.supervisionTag}>
          Dr. Sangeeta Borchetia &amp; Dr. Prabir Barooah
        </Text>
      </View>
    </View>
  );
}

export default function RootLayout() {
  const initializeDevice = useDeviceStore((state) => state.initialize);
  const isReady = useDeviceStore((state) => state.isReady);
  const error = useDeviceStore((state) => state.error);

  const session = useAuthStore((state) => state.session);
  const authInitialized = useAuthStore((state) => state.initialized);
  const initializeAuth = useAuthStore((state) => state.initialize);

  const { captureLocation } = useLocationCapture();

  useEffect(() => {
    async function bootstrap() {
      await getDatabase();
      await initializeDevice();
      await initializeAuth();

      captureLocation()
        .then((coords) => {
          if (!coords) {
            Alert.alert(
              'Location Required',
              'Please enable location services and grant permission to continue.',
              [
                {
                  text: 'OK',
                  onPress: captureLocation,
                },
              ]
            );
          }
        })
        .catch((locationError) => {
          console.error('Location capture failed:', locationError);
        });
    }

    bootstrap().catch((bootstrapError) => {
      console.error('App bootstrap failed:', bootstrapError);
    });
  }, [initializeDevice, initializeAuth, captureLocation]);

  if (!isReady || !authInitialized) {
    return <LoadingSplash />;
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar style="dark" />

        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: {
              backgroundColor: C.page,
            },
          }}
        >
          <Stack.Protected guard={!!session}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>

          <Stack.Protected guard={!session}>
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
          </Stack.Protected>

          {/* Public screens — no auth required */}
          <Stack.Screen name="guide" />
          <Stack.Screen name="verify-email" />
          <Stack.Screen name="verify-signin" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  splashContainer: {
    flex: 1,
    backgroundColor: C.page,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  splashContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    marginBottom: 16,
  },
  logo: {
    width: 68,
    height: 68,
  },
  instituteText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: C.textMuted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: C.navy,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: C.navyMid,
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'center',
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 10,
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  initializingText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: C.navyMid,
  },

  splashFooter: {
    position: 'absolute',
    bottom: 32,
    alignItems: 'center',
    gap: 4,
  },
  versionTag: {
    fontSize: 11,
    fontWeight: '800',
    color: C.gold,
  },
  supervisionTag: {
    fontSize: 10.5,
    color: C.textMuted,
    textAlign: 'center',
  },

  errorBanner: {
    backgroundColor: '#FFEBEE',
    color: C.danger,
    padding: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
});
