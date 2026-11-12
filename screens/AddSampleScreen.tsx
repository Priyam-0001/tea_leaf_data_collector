import { router, useFocusEffect } from 'expo-router';
import { Camera, CheckCircle2, RotateCw } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AutoInfoPanel } from '@/components/AutoInfoPanel';
import { CameraModal } from '@/components/CameraModal';
import { ImageThumbnailList } from '@/components/ImageThumbnailList';
import { SampleFields } from '@/components/SampleFields';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionCard } from '@/components/SectionCard';

import { useImageCapture } from '@/hooks/useImageCapture';
import { useLocationCapture } from '@/hooks/useLocation';
import { useSaveSample } from '@/hooks/useSaveSample';
import { useAlertStore } from '@/store/alertStore';
import { useDeviceStore } from '@/store/deviceStore';
import { useSampleStore } from '@/store/sampleStore';
import type { SampleFormInput } from '@/types/sample';
import { toIsoTimestamp } from '@/utils/dateFormat';
import { validateSample } from '@/utils/sampleValidation';

const C = {
  navy: '#0D1F3C',
  navyMid: '#1E3A5F',
  page: '#F0F5FF',
  card: '#FFFFFF',
  blue: '#2563EB',
  blueLight: '#EFF6FF',
  blueBorder: '#BFDBFE',
  btnPrimary: '#1D3557',
  btnShadow: '#0A1A30',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  border: '#E2E8F0',
  textMuted: '#64748B',
};

export default function AddSampleScreen() {
  const deviceInfo = useDeviceStore((state) => state.deviceInfo);
  const { saveSample, saving, error } = useSaveSample();

  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const {
    coordinates,
    captureLocation,
    loading: gpsLoading,
    error: gpsError,
  } = useLocationCapture();

  const [now] = useState(() => new Date());
  const showAlert = useAlertStore.getState().showAlert;

  const cloneNumber = useSampleStore((state) => state.cloneNumber);
  const flush = useSampleStore((state) => state.flush);
  const gardenName = useSampleStore((state) => state.gardenName);

  const setCloneNumber = useSampleStore((state) => state.setCloneNumber);
  const setFlush = useSampleStore((state) => state.setFlush);
  const setGardenName = useSampleStore((state) => state.setGardenName);

  const { control, handleSubmit } = useForm<SampleFormInput>({
    defaultValues: {
      cloneNumber: cloneNumber,
      treeNumber: '',
      leafNumber: '',
      leafPosition: '1st_leaf',
      meterReading1: '',
      meterReading2: '',
      meterReading3: '',
      wetLabCompleted: false,
      flush: flush,
      flushAutoDetected: false,
      gardenName: gardenName,
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

  const {
    images,
    showCamera,
    setShowCamera,
    openCamera,
    handleCapture,
    removeAndDeleteImage,
    resetImages,
    cleanupNewImages,
  } = useImageCapture();

  useFocusEffect(
    useCallback(() => {
      captureLocation();
    }, [captureLocation])
  );

  useFocusEffect(
    useCallback(() => {
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
    }, [cleanupNewImages])
  );

  const onSubmit = handleSubmit(async (values) => {
    setCloneNumber(values.cloneNumber);
    setFlush(values.flush);
    setGardenName(values.gardenName);

    if (!coordinates) {
      Alert.alert(
        'Location Required',
        'Please enable GPS / location permissions to accurately record sample coordinates.',
        [{ text: 'Retry GPS', onPress: captureLocation }]
      );
      return;
    }

    const validation = validateSample(values);
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.message);
      return;
    }

    const sample = await saveSample({
      ...values,
      images: images.map((image) => image.filePath ?? image.uri),
      coordinates: coordinates,
    });

    if (!sample) {
      showAlert('error', 'Failed to save sample.');
      return;
    }

    showAlert('success', 'Sample saved successfully.');
    resetImages();
    router.back();
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
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Add Sample"
          subtitle="Record chlorophyll readings, images & field data"
        />

        <View style={styles.sections}>
          {/* Form Fields Sections */}
          <SampleFields control={control} />

          {/* Leaf Photos Section */}
          <SectionCard
            title="Leaf Photos"
            badge={images.length > 0 ? `${images.length} Captured` : 'Optional'}
            icon={<Camera size={20} color="#2563EB" />}
          >
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={openCamera}
              activeOpacity={0.8}
            >
              <Camera size={20} color="#FFFFFF" />
              <Text style={styles.captureBtnText}>
                {images.length > 0 ? 'Capture More Photos' : 'Open Camera to Take Photos'}
              </Text>
            </TouchableOpacity>

            <ImageThumbnailList
              images={images.map((image) => image.uri)}
              onRemove={removeAndDeleteImage}
              onImagePress={(index) => {
                setSelectedImageIndex(index);
                setImageViewerVisible(true);
              }}
            />
          </SectionCard>

          {/* Automatic Metadata Section */}
          {deviceInfo && (
            <SectionCard title="System & Location Metadata" badge="Auto">
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

          {/* GPS Loading & Error Banner */}
          {gpsLoading && (
            <View style={styles.gpsBanner}>
              <RotateCw size={14} color={C.blue} />
              <Text style={styles.gpsBannerText}>Acquiring GPS fix from satellites…</Text>
            </View>
          )}

          {gpsError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{gpsError}</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={captureLocation}
                activeOpacity={0.8}
              >
                <Text style={styles.retryBtnText}>Retry Location</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Save & Cancel Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.saveBtn,
                (saving || !coordinates) && styles.saveBtnDisabled,
              ]}
              onPress={onSubmit}
              disabled={saving || !coordinates}
              activeOpacity={0.85}
            >
              <CheckCircle2 size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>
                {saving ? 'Saving Sample…' : 'Save Sample Record'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                cleanupNewImages();
                router.back();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Discard & Go Back</Text>
            </TouchableOpacity>
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
    backgroundColor: C.page,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 40,
  },

  sections: {
    gap: 18,
  },

  captureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.blue,
    borderRadius: 14,
    height: 50,
    shadowColor: C.blue,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  captureBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  gpsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: C.blueLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.blueBorder,
  },
  gpsBannerText: {
    fontSize: 13,
    color: C.blue,
    fontWeight: '600',
  },

  errorContainer: {
    backgroundColor: C.dangerLight,
    padding: 14,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 13,
    color: C.danger,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: C.danger,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  actions: {
    gap: 10,
    marginTop: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.btnPrimary,
    borderRadius: 16,
    height: 56,
    shadowColor: C.btnShadow,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  saveBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.navyMid,
  },
});
