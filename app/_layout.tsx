import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { getDatabase } from '@/database/connection';
import { useLocationCapture } from '@/hooks/useLocation';
import { useDeviceStore } from '@/store/deviceStore';
import { useEffect } from 'react';

export default function RootLayout() {
  const initializeDevice = useDeviceStore((state) => state.initialize);
  const isReady = useDeviceStore((state) => state.isReady);
  const error = useDeviceStore((state) => state.error);

  const {
    captureLocation,
  } = useLocationCapture();

  useEffect(() => {
    async function bootstrap() {
      await getDatabase();
      await initializeDevice();

      captureLocation().then((coords) => {
        if (!coords) {
          Alert.alert(
            'Location Required',
            'Please enable location services and grant permission to continue.',
            [
              { text: 'Ok', onPress: captureLocation }
            ]
          );
          return;
        }
      })
    }
    bootstrap().catch((bootstrapError) => {
      console.error('App bootstrap failed:', bootstrapError);
    });
  }, [initializeDevice]);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Preparing offline storage...</Text>
      </View>
    );
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
            contentStyle: { backgroundColor: COLORS.background },
          }}
        />
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
