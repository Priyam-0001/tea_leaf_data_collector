import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { AutoInfoPanel } from '@/components/AutoInfoPanel';
import { CameraModal } from '@/components/CameraModal';
import { ImageThumbnailList } from '@/components/ImageThumbnailList';
import { SampleFields } from '@/components/SampleFields';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionCard } from '@/components/SectionCard';

import {
  COLORS,
  FONT_SIZES,
  LAYOUT,
  SPACING,
} from '@/constants/theme';

import { useImageCapture } from '@/hooks/useImageCapture';
import { useLocationCapture } from '@/hooks/useLocation';
import { useSaveSample } from '@/hooks/useSaveSample';
import { useAlertStore } from '@/store/alertStore';
import { useDeviceStore } from '@/store/deviceStore';
import type { SampleFormInput } from '@/types/sample';
import { toIsoTimestamp } from '@/utils/dateFormat';
import { validateSample } from '@/utils/sampleValidation';
import ImageViewing from 'react-native-image-viewing';

export default function AddSampleScreen() {
  const deviceInfo = useDeviceStore((state) => state.deviceInfo);

  const { saveSample, saving, error } = useSaveSample();

  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const {
    coordinates,
    captureLocation,
    loading: gpsLoading,
    error: gpsError,
  } = useLocationCapture();

  const [now] = useState(() => new Date());
  const showAlert = useAlertStore.getState().showAlert;

  const {
    control,
    handleSubmit,
    watch,
  } = useForm<SampleFormInput>({
    defaultValues: {
      cloneNumber: '',
      treeNumber: '',
      leafNumber: '',

      leafPosition: '1st_leaf',

      meterReading1: '',
      meterReading2: '',
      meterReading3: '',

      wetLabRequired: false,
      wetLabCompleted: false,

      flush: 'first_flush',
      flushAutoDetected: false,

      gardenName: '',
      sectionName: '',

      healthy: false,
      wilting: false,
      chlorosis: false,
      scorching: false,
      pestDamage: false,
      disease: false,

      remarks: '',
    },
  });

  const cloneNumber = watch('cloneNumber');
  const treeNumber = watch('treeNumber');
  const leafNumber = watch('leafNumber');

  const {
    images,
    showCamera,
    setShowCamera,
    openCamera,
    handleCapture,
    removeAndDeleteImage,
    resetImages,
    cleanupNewImages,
  } = useImageCapture({
    cloneNumber,
    treeNumber,
    leafNumber,
    installationId: deviceInfo?.installationId,
  });

  // Refresh location whenever screen regains focus (e.g., user comes back from settings)
  useFocusEffect(
    useCallback(() => {
      captureLocation();
    }, [captureLocation])
  );

  useEffect(() => {
    const handleHardwareBack = () => {

      cleanupNewImages();
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleHardwareBack
    );

    return () => backHandler.remove();
  }, []);

  const onSubmit = handleSubmit(async (values) => {

    // Require valid location coordinates before saving
    if (!coordinates) {
      Alert.alert(
        'Location Required',
        'Please enable location services and grant permission to save the sample.',
        [
          { text: 'Retry', onPress: captureLocation }
        ]
      );
      return;
    }

    const validation = validateSample(values);

    if (!validation.valid) {
      Alert.alert(
        'Validation Error',
        validation.message,
      );
      return;
    }

    const sample = await saveSample({
      ...values,
      images: images.map((image) => image.filePath ?? image.uri),
      coordinates: coordinates,
    });

    if (!sample) {
      showAlert('error', "Failed to save sample.");
      return;
    }

    showAlert('success', "Sample saved.");
    router.back();

    // Alert.alert(
    //   'Sample Saved',
    //   `Sample ID: ${sample.id}`,
    //   [
    //     {
    //       text: 'OK',
    //       onPress: () => router.back(),
    //     },
    //   ],
    // );

    resetImages();
  });

  useEffect(() => {
    if (!error) return;

    Alert.alert('Save Failed', error);
  }, [error]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <ScreenHeader
          title="Add Sample"
          subtitle="Capture images and enter sample details"
        />

        <View style={styles.sections}>

          <SampleFields control={control} />

          <SectionCard title="Images">
            <ActionButton
              label="Capture Images"
              onPress={openCamera}
            />

            <ImageThumbnailList
              images={images.map((image) => image.uri)}
              onRemove={removeAndDeleteImage}
              onImagePress={(index) => {
                setSelectedImageIndex(index);
                setImageViewerVisible(true)
              }}
            />
          </SectionCard>

          {deviceInfo && (
            <SectionCard title="Automatic Information">
              <AutoInfoPanel
                timestamp={toIsoTimestamp(now)}
                latitude={coordinates?.latitude ?? null}
                longitude={coordinates?.longitude ?? null}
                deviceManufacturer={deviceInfo.manufacturer}
                deviceModel={deviceInfo.model}
                installationId={deviceInfo.installationId}
                appVersion={deviceInfo.appVersion}
              />
            </SectionCard>
          )}

          {gpsLoading && (
            <Text style={styles.helper}>
              Reading GPS...
            </Text>
          )}

          {gpsError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{gpsError}</Text>
              <ActionButton
                label="Retry Location"
                onPress={captureLocation}
                style={styles.retryButton}
              />
            </View>
          )}

          <View style={styles.actions}>
            <ActionButton
              label={saving ? 'Saving...' : 'Save Sample'}
              onPress={onSubmit}
              disabled={saving || !coordinates}
            />

            <ActionButton
              label="Back"
              variant="secondary"
              onPress={() => {
                cleanupNewImages();
                router.back();
              }}
            />
          </View>
        </View>
      </ScrollView>

      <ImageViewing
        images={images.map((image) => ({
          uri: image.uri,
        }))}
        imageIndex={selectedImageIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />

      <CameraModal
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCapture}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },

  sections: {
    gap: LAYOUT.sectionGap,
  },

  actions: {
    gap: SPACING.md,
  },

  helper: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: SPACING.md,
    borderRadius: 8,
    gap: SPACING.sm,
  },

  errorText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.danger,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: SPACING.xs,
  },
});
