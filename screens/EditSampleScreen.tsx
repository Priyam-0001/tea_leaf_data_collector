import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, Edit3, X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
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

import { sampleRepository } from '@/database/sampleRepository';
import { useImageCapture } from '@/hooks/useImageCapture';
import { deleteSampleImage } from '@/services/imageService';
import type { Sample, SampleFormInput } from '@/types/sample';
import { validateSample } from '@/utils/sampleValidation';

const C = {
  navy: '#0D1F3C',
  navyMid: '#1E3A5F',
  page: '#F0F5FF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  blue: '#2563EB',
  blueLight: '#EFF6FF',
  blueBorder: '#BFDBFE',
  btnPrimary: '#1D3557',
  btnShadow: '#0A1A30',
  textMuted: '#64748B',
  textDark: '#1E293B',
};

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function formatBoolean(value: boolean) {
  return value ? 'Yes' : 'No';
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2}>
        {value}
      </Text>
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
      <SectionCard title="Captured Leaf Photos" badge={`${sample.images.length} Photos`}>
        <ImageThumbnailList images={sample.images} onImagePress={onImagePress} />
      </SectionCard>

      <SectionCard title="Sample Information" badge="Details">
        <View style={styles.idCard}>
          <Text style={styles.idCardLabel}>Sample ID</Text>
          <Text style={styles.idCardValue} selectable>
            {sample.id}
          </Text>
        </View>

        <DetailRow label="Clone Number" value={sample.cloneNumber || '-'} />
        <DetailRow label="Tree Number" value={sample.treeNumber || '-'} />
        <DetailRow label="Leaf Number" value={sample.leafNumber || '-'} />
        <DetailRow label="Leaf Position" value={sample.leafPosition || '-'} />
      </SectionCard>

      <SectionCard title="Chlorophyll Meter Readings" badge="SPAD">
        <View style={styles.readingsGrid}>
          <View style={styles.readingBox}>
            <Text style={styles.readingBoxLabel}>Reading 1</Text>
            <Text style={styles.readingBoxValue}>{sample.meterReading1}</Text>
          </View>
          <View style={styles.readingBox}>
            <Text style={styles.readingBoxLabel}>Reading 2</Text>
            <Text style={styles.readingBoxValue}>{sample.meterReading2}</Text>
          </View>
          <View style={styles.readingBox}>
            <Text style={styles.readingBoxLabel}>Reading 3</Text>
            <Text style={styles.readingBoxValue}>{sample.meterReading3}</Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Collection Information" badge="Location">
        <DetailRow label="Flush Season" value={sample.flush || '-'} />
        <DetailRow label="Garden Name" value={sample.gardenName || '-'} />
        <DetailRow label="Section Name" value={sample.sectionName || '-'} />
      </SectionCard>

      <SectionCard title="Plant Health Observations" badge="Status">
        <DetailRow label="Healthy" value={formatBoolean(sample.healthy)} />
        <DetailRow label="Wilting" value={formatBoolean(sample.wilting)} />
        <DetailRow label="Chlorosis" value={formatBoolean(sample.chlorosis)} />
        <DetailRow label="Scorching" value={formatBoolean(sample.scorching)} />
        <DetailRow label="Pest Damage" value={formatBoolean(sample.pestDamage)} />
        <DetailRow label="Disease" value={formatBoolean(sample.disease)} />
      </SectionCard>

      <SectionCard title="Field Notes & Remarks">
        <Text style={styles.remarksText}>
          {sample.remarks?.trim() || 'No remarks recorded.'}
        </Text>
      </SectionCard>

      <SectionCard title="System Metadata" badge="Hardware">
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
  const { id } = useLocalSearchParams<{ id: string }>();

  const [sample, setSample] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [removedPaths, setRemovedPaths] = useState<string[]>([]);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleImagePress = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setImageViewerVisible(true);
  }, []);

  const { control, handleSubmit, reset } = useForm<SampleFormInput>({
    defaultValues: {
      cloneNumber: '',
      treeNumber: '',
      leafNumber: '',
      leafPosition: '1st_leaf',
      meterReading1: '',
      meterReading2: '',
      meterReading3: '',
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

  const {
    images,
    showCamera,
    setShowCamera,
    openCamera,
    handleCapture,
    removeImage,
    setExistingImages,
    cleanupNewImages,
  } = useImageCapture();

  const loadSample = useCallback(async () => {
    if (!id) return;
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
    }, [loadSample])
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      const removed = images[index];
      if (removed?.filePath && !removed.isNew) {
        setRemovedPaths((prev) => [...prev, removed.filePath!]);
      }
      removeImage(index);
    },
    [images, removeImage]
  );

  const handleCancelEdit = useCallback(() => {
    cleanupNewImages();
    if (sample) {
      setExistingImages(sample.images);
      setRemovedPaths([]);
    }
    setEditMode(false);
  }, [cleanupNewImages, sample, setExistingImages]);

  useFocusEffect(
    useCallback(() => {
      const handleHardwareBack = () => {
        if (editMode) {
          handleCancelEdit();
          return true;
        }
        cleanupNewImages();
        router.back();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleHardwareBack
      );
      return () => backHandler.remove();
    }, [editMode, handleCancelEdit, cleanupNewImages])
  );

  const onSubmit = handleSubmit(async (values) => {
    if (!sample) return;

    const validation = validateSample(values);
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.message);
      return;
    }

    setSaving(true);
    try {
      const updatedImages = images.map((img) => img.filePath ?? img.uri);
      await sampleRepository.update(sample.id, {
        ...values,
        meterReading1: Number(values.meterReading1),
        meterReading2: Number(values.meterReading2),
        meterReading3: Number(values.meterReading3),
        images: updatedImages,
      });

      for (const path of removedPaths) {
        await deleteSampleImage(path);
      }

      setRemovedPaths([]);
      setEditMode(false);
      await loadSample();
      Alert.alert('Updated 🎉', 'Sample details have been saved.');
    } catch (err) {
      Alert.alert('Update Failed', err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.blue} />
        <Text style={styles.loadingText}>Loading sample record…</Text>
      </SafeAreaView>
    );
  }

  if (!sample) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Mode Toggle Pill */}
        <View style={styles.headerBar}>
          <ScreenHeader
            title={editMode ? 'Edit Sample' : 'Sample Record'}
            subtitle={editMode ? 'Modify and save updated field data' : 'Review details collected in field'}
            onBack={editMode ? handleCancelEdit : undefined}
          />

          {!editMode ? (
            <TouchableOpacity
              style={styles.editPillBtn}
              onPress={() => setEditMode(true)}
              activeOpacity={0.8}
            >
              <Edit3 size={15} color="#FFFFFF" />
              <Text style={styles.editPillText}>Edit Sample</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {editMode ? (
          <View style={styles.sections}>
            <SectionCard title="Captured Leaf Photos" badge={`${images.length} Photos`}>
              <TouchableOpacity
                style={styles.captureBtn}
                onPress={openCamera}
                activeOpacity={0.8}
              >
                <Text style={styles.captureBtnText}>+ Capture New Photos</Text>
              </TouchableOpacity>

              <ImageThumbnailList
                images={images.map((image) => image.uri)}
                onRemove={handleRemoveImage}
                onImagePress={handleImagePress}
              />
            </SectionCard>

            <SampleFields control={control} />

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.btnDisabled]}
                onPress={onSubmit}
                disabled={saving}
                activeOpacity={0.85}
              >
                <CheckCircle2 size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>
                  {saving ? 'Updating Record…' : 'Save Changes'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCancelEdit}
                disabled={saving}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel Editing</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.viewContainer}>
            <ViewSampleDetails sample={sample} onImagePress={handleImagePress} />

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                cleanupNewImages();
                router.back();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.backBtnText}>Back to Samples List</Text>
            </TouchableOpacity>
          </View>
        )}
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
    backgroundColor: C.page,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.page,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: C.textMuted,
    fontWeight: '600',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerBar: {
    marginBottom: 8,
  },
  editPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.blue,
    borderRadius: 14,
    height: 44,
    marginTop: -6,
    marginBottom: 16,
    shadowColor: C.blue,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  editPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  sections: {
    gap: 18,
  },
  viewContainer: {
    gap: 18,
  },

  idCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 6,
  },
  idCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  idCardValue: {
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: C.navy,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  detailLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: C.textMuted,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: C.navy,
    textAlign: 'right',
    flex: 1,
  },

  readingsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  readingBox: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  readingBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 4,
  },
  readingBoxValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#15803D',
  },

  remarksText: {
    fontSize: 14,
    color: C.textDark,
    lineHeight: 22,
  },

  captureBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: C.blueBorder,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  captureBtnText: {
    color: C.blue,
    fontSize: 14,
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
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  btnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: C.card,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.navyMid,
  },
  backBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: C.card,
    marginTop: 8,
  },
  backBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: C.navyMid,
  },
});
