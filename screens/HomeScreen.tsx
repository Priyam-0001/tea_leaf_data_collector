import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Alert, BackHandler, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { uploadAllSamples } from '@/services/sampleUploadService';
import { useAuthStore } from '@/store/authStore';
import { useDeviceStore } from '@/store/deviceStore';
import { useSampleStore } from '@/store/sampleStore';
import { ScrollView } from 'react-native-gesture-handler';

export default function HomeScreen() {
  const deviceInfo = useDeviceStore((state) => state.deviceInfo);
  const samples = useSampleStore((state) => state.samples);
  const loading = useSampleStore((state) => state.loading);
  const loadSamples = useSampleStore((state) => state.loadSamples);
  const signOut = useAuthStore((state) => state.signOut);

  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        loadSamples();
      }
    }, [loadSamples])
  );

  const samplesWithImages = samples.filter(sample => sample.images.length > 0).length;
  const samplesWithoutImages = samples.length - samplesWithImages;

  const handleUploadAllSamples = async () => {
    try {
      console.log('Starting sample upload...');

      const result = await uploadAllSamples((progress) => {
        // console.log('UPLOAD PROGRESS:', progress);
      });

      console.log('UPLOAD RESULT:', result);
    } catch (error) {
      console.error('UPLOAD ERROR:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('../login');
            } catch (error) {
              Alert.alert(
                'Logout Failed',
                error instanceof Error
                  ? error.message
                  : 'Unable to logout.'
              );
            }
          },
        },
      ],
      {
        cancelable: true,
      }
    );
  };

  const handleExit = () => {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    }
  };

  return (
    <SafeAreaProvider>
      <ScrollView
        keyboardShouldPersistTaps="handled"
      >
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
              <ActionButton label="Upload all samples" onPress={handleUploadAllSamples} variant='tertiary' />
              <View style={[styles.buttons, { flexDirection: 'row' }]}>
                <ActionButton label="Logout" onPress={handleLogout} style={{ flex: 1 }} variant="danger" />
                <ActionButton label="Exit" onPress={handleExit} style={{ flex: 1 }} variant="danger" />
              </View>
            </View>

            {deviceInfo ? (
              <Text style={styles.deviceInfo}>
                Device: {deviceInfo.manufacturer} {deviceInfo.model}
              </Text>
            ) : null}
          </View>
        </SafeAreaView>
      </ScrollView>
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
