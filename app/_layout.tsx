import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  AppState,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useCallback, useEffect, useRef, useState } from 'react';

import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { getDatabase } from '@/database/connection';
import { useLocationCapture } from '@/hooks/useLocation';
import { useAuthStore } from '@/store/authStore';
import { useDeviceStore } from '@/store/deviceStore';
import AppLockScreen from '@/components/AppLockScreen';

const BACKGROUND_GRACE_PERIOD = 30_000;

export default function RootLayout() {
  const initializeDevice = useDeviceStore((state) => state.initialize);
  const isReady = useDeviceStore((state) => state.isReady);
  const error = useDeviceStore((state) => state.error);

  const session = useAuthStore((state) => state.session);
  const authInitialized = useAuthStore((state) => state.initialized);
  const initializeAuth = useAuthStore((state) => state.initialize);

  const { captureLocation } = useLocationCapture();

  // Always locked when the root layout is first mounted.
  const [isUnlocked, setIsUnlocked] = useState(false);

  const backgroundTimestamp = useRef<number | null>(null);
  const backgroundTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const locationCaptureStarted = useRef(false);

  const clearBackgroundTimer = useCallback(() => {
    if (backgroundTimer.current) {
      clearTimeout(backgroundTimer.current);
      backgroundTimer.current = null;
    }
  }, []);

  // Initialize the existing app services.
  useEffect(() => {
    async function bootstrap() {
      await getDatabase();
      await initializeDevice();
      await initializeAuth();
    }

    bootstrap().catch((bootstrapError) => {
      console.error('App bootstrap failed:', bootstrapError);
    });
  }, [initializeDevice, initializeAuth]);

  // Capture location only after the app has been unlocked and initialized.
  useEffect(() => {
    if (!isUnlocked || !isReady || !authInitialized) {
      return;
    }

    if (locationCaptureStarted.current) {
      return;
    }

    locationCaptureStarted.current = true;

    captureLocation().then((coords) => {
      if (!coords) {
        Alert.alert(
          'Location Required',
          'Please enable location services and grant permission to continue.',
          [{ text: 'OK', onPress: captureLocation }],
        );
      }
    }).catch((locationError) => {
      console.error('Location capture failed:', locationError);
    });
  }, [isUnlocked, isReady, authInitialized, captureLocation]);

  // Lock immediately on cold launch; after unlocking, allow a
  // 30-second grace period when the app goes into the background.
  useEffect(() => {
    if (!isUnlocked) {
      clearBackgroundTimer();
      backgroundTimestamp.current = null;
      return;
    }

    const subscription = AppState.addEventListener(
      'change',
      (nextState) => {
        if (nextState === 'background' || nextState === 'inactive') {
          if (backgroundTimestamp.current === null) {
            backgroundTimestamp.current = Date.now();

            clearBackgroundTimer();

            backgroundTimer.current = setTimeout(() => {
              setIsUnlocked(false);
              backgroundTimer.current = null;
            }, BACKGROUND_GRACE_PERIOD);
          }

          return;
        }

        if (nextState === 'active') {
          const backgroundedAt = backgroundTimestamp.current;

          if (backgroundedAt !== null) {
            const elapsed = Date.now() - backgroundedAt;

            if (elapsed >= BACKGROUND_GRACE_PERIOD) {
              setIsUnlocked(false);
            }

            backgroundTimestamp.current = null;
            clearBackgroundTimer();
          }
        }
      },
    );

    return () => {
      subscription.remove();
      clearBackgroundTimer();
    };
  }, [isUnlocked, clearBackgroundTimer]);

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar style="dark" />

        {!isUnlocked ? (
          <AppLockScreen
            onUnlock={() => setIsUnlocked(true)}
          />
        ) : !isReady || !authInitialized ? (
          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
            />
            <Text style={styles.loadingText}>
              Preparing offline storage...
            </Text>
          </View>
        ) : (
          <>
            {error ? (
              <Text style={styles.errorBanner}>{error}</Text>
            ) : null}

            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
                contentStyle: {
                  backgroundColor: COLORS.background,
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
            </Stack>
          </>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    color: COLORS.danger,
    padding: SPACING.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
});