import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
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
import { sampleRepository } from '@/database/sampleRepository';
import { useImageCapture } from '@/hooks/useImageCapture';
import { deleteSampleImage } from '@/services/imageService';
import type {
  Sample,
  SampleFormInput,
} from '@/types/sample';
import { validateSample } from '@/utils/sampleValidation';
import ImageViewing from 'react-native-image-viewing';

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function formatBoolean(value: boolean) {
  return value ? 'Yes' : 'No';
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function ViewSampleDetails({
  sample,
  onImagePress,
}: {
  sample: Sample;
  onImagePress: (index: number) => void;
}) {
  return (
    <View style={styles.sections}>
      <SectionCard title="Leaf Images">
        <ImageThumbnailList
          images={sample.images}
          onImagePress={onImagePress}
        />
      </SectionCard>

      <SectionCard title="Sample Information">
        <DetailRow label="Sample ID" value={sample.id} />
        <DetailRow label="Clone Number" value={sample.cloneNumber} />
        <DetailRow label="Tree Number" value={sample.treeNumber} />
        <DetailRow label="Leaf Number" value={sample.leafNumber} />
        <DetailRow label="Leaf Position" value={sample.leafPosition} />
      </SectionCard>

      <SectionCard title="Meter Readings">
        <DetailRow label="Meter Reading 1" value={String(sample.meterReading1)} />
        <DetailRow label="Meter Reading 2" value={String(sample.meterReading2)} />
        <DetailRow label="Meter Reading 3" value={String(sample.meterReading3)} />
      </SectionCard>

      <SectionCard title="Collection Information">
        <DetailRow label="Flush" value={sample.flush} />
        {/* <DetailRow label="Flush Auto Detected" value={formatBoolean(sample.flushAutoDetected)} /> */}
        {/* <DetailRow label="Wet Lab Required" value={formatBoolean(sample.wetLabRequired)} /> */}
        {/* <DetailRow label="Wet Lab Completed" value={formatBoolean(sample.wetLabCompleted)} /> */}
      </SectionCard>

      <SectionCard title="Location">
        <DetailRow label="Garden Name" value={sample.gardenName} />
        <DetailRow label="Section Name" value={sample.sectionName} />
      </SectionCard>

      <SectionCard title="Plant Health">
        <DetailRow label="healthy" value={formatBoolean(sample.healthy)} />
        <DetailRow label="Wilting" value={formatBoolean(sample.wilting)} />
        <DetailRow label="Chlorosis" value={formatBoolean(sample.chlorosis)} />
        <DetailRow label="Scorching" value={formatBoolean(sample.scorching)} />
        <DetailRow label="Pest Damage" value={formatBoolean(sample.pestDamage)} />
        <DetailRow label="Disease" value={formatBoolean(sample.disease)} />
      </SectionCard>

      <SectionCard title="Remarks">
        <Text style={styles.remarksText}>
          {sample.remarks.trim() || 'No remarks'}
        </Text>
      </SectionCard>

      <SectionCard title="Automatic Information">
        <AutoInfoPanel
          sampleIdPreview={sample.id}
          timestamp={formatDateTime(sample.createdAt)}
          latitude={sample.gpsLatitude}
          longitude={sample.gpsLongitude}
          deviceManufacturer={sample.deviceManufacturer}
          deviceModel={sample.deviceModel}
          installationId={sample.installationId}
          appVersion={sample.appVersion}
        />

        <DetailRow label="Created At" value={formatDateTime(sample.createdAt)} />
        <DetailRow label="Updated At" value={formatDateTime(sample.updatedAt)} />
      </SectionCard>
    </View>
  );
}

export default function EditSampleScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [sample, setSample] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [removedPaths, setRemovedPaths] = useState<string[]>([]);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const handleHardwareBack = () => {
      if(editMode){
        handleCancelEdit();
      }else{
        cleanupNewImages();
        router.back();
      }
      return true; 
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleHardwareBack
    );

    return () => backHandler.remove();
  }, []);

  const handleImagePress = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setImageViewerVisible(true);
  }, []);

  const {
    control,
    handleSubmit,
    reset,
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
    removeImage,
    removeAndDeleteImage,
    setExistingImages,
    cleanupNewImages,
  } = useImageCapture({
    cloneNumber,
    treeNumber,
    leafNumber,
    installationId: sample?.installationId,
  });

  const loadSample = useCallback(async () => {
    if (!id) {
      return;
    }

    setLoading(true);

    try {
      const loaded = await sampleRepository.getById(id);

      if (!loaded) {
        Alert.alert('Error', 'Sample not found.');
        router.back();
        return;
      }

      setSample(loaded);

      reset({
        cloneNumber: loaded.cloneNumber,
        treeNumber: loaded.treeNumber,
        leafNumber: loaded.leafNumber,
        leafPosition: loaded.leafPosition,
        meterReading1: loaded.meterReading1.toString(),
        meterReading2: loaded.meterReading2.toString(),
        meterReading3: loaded.meterReading3.toString(),
        wetLabCompleted: loaded.wetLabCompleted,
        flush: loaded.flush,
        flushAutoDetected: loaded.flushAutoDetected,
        gardenName: loaded.gardenName,
        sectionName: loaded.sectionName,
        healthy: loaded.healthy,
        wilting: loaded.wilting,
        chlorosis: loaded.chlorosis,
        scorching: loaded.scorching,
        pestDamage: loaded.pestDamage,
        disease: loaded.disease,
        remarks: loaded.remarks,
      });

      setExistingImages(loaded.images);
      setRemovedPaths([]);
    } catch {
      Alert.alert('Error', 'Failed to load sample.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, reset, setExistingImages]);

  useFocusEffect(
    useCallback(() => {
      loadSample();
    }, [loadSample]),
  );

  useEffect(() => {
    if (!editMode) {
      setRemovedPaths([]);
    }
  }, [editMode]);

  const handleRemoveImage = useCallback((index: number) => {
    const target = images[index];
    const path = target?.filePath ?? target?.uri;

    if (target?.isNew) {
      removeAndDeleteImage(index);
    } else {
      if (path) {
        setRemovedPaths((current) => [...current, path]);
      }
      removeImage(index);
    }
  }, [images, removeAndDeleteImage, removeImage]);

  const handleCancelEdit = useCallback(() => {
    if (!sample) {
      return;
    }

    reset({
      cloneNumber: sample.cloneNumber,
      treeNumber: sample.treeNumber,
      leafNumber: sample.leafNumber,
      leafPosition: sample.leafPosition,
      meterReading1: sample.meterReading1.toString(),
      meterReading2: sample.meterReading2.toString(),
      meterReading3: sample.meterReading3.toString(),
      wetLabCompleted: sample.wetLabCompleted,
      flush: sample.flush,
      flushAutoDetected: sample.flushAutoDetected,
      gardenName: sample.gardenName,
      sectionName: sample.sectionName,
      healthy: sample.healthy,
      wilting: sample.wilting,
      chlorosis: sample.chlorosis,
      scorching: sample.scorching,
      pestDamage: sample.pestDamage,
      disease: sample.disease,
      remarks: sample.remarks,
    });
    cleanupNewImages();
    setExistingImages(sample.images);
    setRemovedPaths([]);
    setEditMode(false);
  }, [cleanupNewImages, reset, sample, setExistingImages]);

  const onSubmit = handleSubmit(async (values) => {
    if (!sample) return;

    const validation = validateSample(values);

    if (!validation.valid) {
      Alert.alert('Validation Error', validation.message);
      return;
    }

    try {
      setSaving(true);

      const updated = await sampleRepository.update(sample.id, {
        ...values,
        meterReading1: Number(values.meterReading1),
        meterReading2: Number(values.meterReading2),
        meterReading3: Number(values.meterReading3),
        images: images.map((image) => image.filePath ?? image.uri),
      });

      removedPaths.forEach(deleteSampleImage);
      setSample(updated);
      setExistingImages(updated.images);
      setRemovedPaths([]);
      setEditMode(false);

      Alert.alert('Success', 'Sample updated successfully.');
    } catch (err) {
      Alert.alert(
        'Update Failed',
        err instanceof Error
          ? err.message
          : 'Failed to update sample.',
      );
    } finally {
      setSaving(false);
    }
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Loading sample...
        </Text>
      </SafeAreaView>
    );
  }

  if (!sample) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <ScreenHeader
              title={editMode ? 'Edit Sample' : 'View Sample'}
              subtitle={editMode ? 'Modify the selected sample' : 'Review the full details of this sample'}
            />
          </View>

          {!editMode ? (
            <Pressable
              onPress={() => setEditMode(true)}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
          ) : null}
        </View>

        {editMode ? (
          <View style={styles.sections}>
            <SectionCard title="Leaf Images">
              <ActionButton
                label="Capture Images"
                onPress={openCamera}
              />

              <ImageThumbnailList
                images={images.map((image) => image.uri)}
                onRemove={handleRemoveImage}
                onImagePress={handleImagePress}
              />
            </SectionCard>

            <SampleFields control={control} />

            <SectionCard title="Automatic Information">
              <AutoInfoPanel
                sampleIdPreview={sample.id}
                timestamp={formatDateTime(sample.createdAt)}
                latitude={sample.gpsLatitude}
                longitude={sample.gpsLongitude}
                deviceManufacturer={sample.deviceManufacturer}
                deviceModel={sample.deviceModel}
                installationId={sample.installationId}
                appVersion={sample.appVersion}
              />
            </SectionCard>

            <View style={styles.actions}>
              <ActionButton
                label={saving ? 'Updating...' : 'Update Sample'}
                onPress={onSubmit}
                disabled={saving}
              />

              <ActionButton
                label="Cancel Edit"
                variant="secondary"
                onPress={handleCancelEdit}
                disabled={saving}
              />
            </View>
          </View>
        ) : (
          <ViewSampleDetails
            sample={sample}
            onImagePress={handleImagePress}
          />
        )}

        {!editMode ? (
          <ActionButton
            label="Back"
            variant="secondary"
            onPress={() => {
              cleanupNewImages();
              router.back();
            }}
          />
        ) : null}
      </ScrollView>

      <CameraModal
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCapture}
      />

      <ImageViewing
        images={
          editMode
            ? images.map((image) => ({ uri: image.uri }))
            : sample.images.map((uri) => ({ uri }))
        }
        imageIndex={selectedImageIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  editButton: {
    marginTop: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  editButtonText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sections: {
    gap: LAYOUT.sectionGap,
  },
  actions: {
    gap: SPACING.md,
  },
  detailRow: {
    gap: SPACING.xs,
  },
  detailLabel: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    color: COLORS.text,
  },
  detailValue: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
  },
  remarksText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
});
