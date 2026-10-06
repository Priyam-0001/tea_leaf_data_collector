import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Alert, BackHandler, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useDeviceStore } from '@/store/deviceStore';
import { useSampleStore } from '@/store/sampleStore';
import { supabase } from '@/database/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';

export default function HomeScreen() {
  const deviceInfo = useDeviceStore((state) => state.deviceInfo);
  const samples = useSampleStore((state) => state.samples);
  const loading = useSampleStore((state) => state.loading);
  const loadSamples = useSampleStore((state) => state.loadSamples);
  const signOut = useAuthStore((state) => state.signOut);
  const authLoading = useAuthStore((state) => state.isLoading);

  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        loadSamples();
      }
    }, [loadSamples])
  );

  const samplesWithImages = samples.filter(sample => sample.images.length > 0).length;
  const samplesWithoutImages = samples.length - samplesWithImages;

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert(
        'Logout Failed',
        error instanceof Error
          ? error.message
          : 'Unable to logout.'
      );
    }
  };

  const handleExit = () => {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    }
  };

  

const testCloudinarySigning = async () => {
  try {
    const { data, error } = await supabase.functions.invoke(
      'cloudinary-signin',
      {
        body: {},
      }
    );

    if (error) {
      if (error instanceof FunctionsHttpError) {
        const errorBody = await error.context.json();

        console.error(
          'Cloudinary signing function returned:',
          errorBody
        );

        console.error(
          'Status:',
          error.context.status
        );
      } else {
        console.error('Function invocation error:', error);
      }

      return;
    }

    console.log('Cloudinary signing response:', data);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
};

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.page}>
        <View style={styles.container}>
          <Text style={styles.title}>Tea Leaf Data Collector</Text>
          <Text style={styles.subtitle}>Offline field data collection</Text>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{samplesWithImages}</Text>
              <Text style={styles.statLabel}>Sample(s) With Images</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{samplesWithoutImages}</Text>
              <Text style={styles.statLabel}>Sample(s) Without Images</Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <ActionButton label="Add Sample" onPress={() => router.push('/add-sample')} />
            <ActionButton label="View/Update Sample" onPress={() => router.push('/update-sample')} />
            <ActionButton label="Export Records" onPress={() => router.push('/export-records')} />
            <ActionButton label="Logout" onPress={handleLogout} variant="danger" />
            <ActionButton label="Exit" onPress={handleExit} variant="danger" />
            <ActionButton label="Test Sign" onPress={testCloudinarySigning} />
          </View>

          {deviceInfo ? (
            <Text style={styles.deviceInfo}>
              Device: {deviceInfo.manufacturer} {deviceInfo.model}
            </Text>
          ) : null}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.title,
    // color: COLORS.text,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.subtitle,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SPACING.md,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  buttons: {
    gap: SPACING.md,
  },
  deviceInfo: {
    marginTop: SPACING.xl,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
