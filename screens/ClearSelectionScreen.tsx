import { router, useFocusEffect } from 'expo-router';
import { Check, CheckSquare, Square, Trash2 } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import {
  clearSelectedRecords,
  getExportSelectionData,
} from '@/services/exportService';
import type { Sample } from '@/types/sample';

const C = {
  navy: '#0D1F3C',
  navyMid: '#1E3A5F',
  page: '#F0F5FF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  dangerBorder: '#FECACA',
  textMuted: '#64748B',
  blue: '#2563EB',
};

export default function ClearSelectionScreen() {
  const [samplesWithImages, setSamplesWithImages] = useState<Sample[]>([]);
  const [samplesWithoutImages, setSamplesWithoutImages] = useState<Sample[]>([]);
  const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const loadSamples = useCallback(async () => {
    try {
      const result = await getExportSelectionData();
      setSamplesWithImages(result.samplesWithImages);
      setSamplesWithoutImages(result.samplesWithoutImages);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load samples.';
      Alert.alert('Load Failed', message, [
        { text: 'Back', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSamples();
    }, [loadSamples])
  );

  const allSamples = useMemo(
    () => [...samplesWithImages, ...samplesWithoutImages],
    [samplesWithImages, samplesWithoutImages]
  );

  const selectedSamples = useMemo(
    () => allSamples.filter((sample) => selectedSampleIds.includes(sample.id)),
    [allSamples, selectedSampleIds]
  );

  const handleToggleSample = useCallback((sampleId: string) => {
    setSelectedSampleIds((current) =>
      current.includes(sampleId)
        ? current.filter((id) => id !== sampleId)
        : [...current, sampleId]
    );
  }, []);

  const handleToggleAll = useCallback(() => {
    if (selectedSampleIds.length === allSamples.length) {
      setSelectedSampleIds([]);
    } else {
      setSelectedSampleIds(allSamples.map((s) => s.id));
    }
  }, [allSamples, selectedSampleIds]);

  const confirmClear = useCallback(() => {
    Alert.alert(
      'Permanent Deletion Warning',
      `Are you sure you want to permanently delete ${selectedSamples.length} record(s) and their attached photos?\n\nThis action CANNOT be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              setClearing(true);
              await clearSelectedRecords(selectedSamples);
              Alert.alert('Deleted', 'Selected records have been cleared from local storage.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Failed to clear records.';
              Alert.alert('Clear Failed', message);
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  }, [selectedSampleIds, selectedSamples.length]);

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Clear Records"
          subtitle="Select and permanently remove local sample data"
        />

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Trash2 size={18} color={C.danger} />
          <Text style={styles.warningText}>
            Selected records and associated photo files will be deleted from device memory.
          </Text>
        </View>

        {/* Bulk Select Row */}
        {allSamples.length > 0 ? (
          <View style={styles.selectionBar}>
            <TouchableOpacity
              style={styles.toggleAllBtn}
              onPress={handleToggleAll}
              activeOpacity={0.7}
            >
              {selectedSampleIds.length === allSamples.length ? (
                <CheckSquare size={18} color={C.navy} />
              ) : (
                <Square size={18} color={C.textMuted} />
              )}
              <Text style={styles.toggleAllText}>
                {selectedSampleIds.length === allSamples.length
                  ? 'Deselect All'
                  : 'Select All Samples'}
              </Text>
            </TouchableOpacity>

            <View style={styles.counterPill}>
              <Text style={styles.counterText}>
                {selectedSampleIds.length} / {allSamples.length}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Samples List */}
        {allSamples.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {loading ? 'Reading local database…' : 'No Records Available'}
            </Text>
            <Text style={styles.emptySub}>
              {loading
                ? 'Please wait while samples are loaded.'
                : 'There are currently no samples stored on this device.'}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {allSamples.map((sample) => {
              const isSelected = selectedSampleIds.includes(sample.id);
              return (
                <Pressable
                  key={sample.id}
                  onPress={() => handleToggleSample(sample.id)}
                  style={[
                    styles.sampleRow,
                    isSelected ? styles.sampleRowSelected : null,
                  ]}
                >
                  <View style={[styles.checkbox, isSelected ? styles.checkboxActive : null]}>
                    {isSelected ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
                  </View>

                  <View style={styles.sampleDetails}>
                    <View style={styles.sampleHeader}>
                      <Text style={styles.cloneText}>Clone: {sample.cloneNumber || '-'}</Text>
                      <Text style={styles.photoCount}>
                        {sample.images?.length || 0} photo(s)
                      </Text>
                    </View>
                    <Text style={styles.subText}>
                      Tree #{sample.treeNumber || '-'} • Leaf #{sample.leafNumber || '-'}
                    </Text>
                    <Text style={styles.idText}>ID: {sample.id.slice(0, 16)}…</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Action Controls */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.deleteBtn,
              (selectedSamples.length === 0 || clearing) && styles.deleteBtnDisabled,
            ]}
            onPress={confirmClear}
            disabled={selectedSamples.length === 0 || clearing}
            activeOpacity={0.85}
          >
            <Trash2 size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.deleteBtnText}>
              {clearing ? 'Deleting Records…' : `Delete (${selectedSamples.length}) Record(s)`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.page,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 14,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.dangerLight,
    borderWidth: 1.5,
    borderColor: C.dangerBorder,
    borderRadius: 16,
    padding: 14,
  },
  warningText: {
    flex: 1,
    fontSize: 12.5,
    color: '#991B1B',
    lineHeight: 18,
    fontWeight: '600',
  },

  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  toggleAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleAllText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: C.navy,
  },
  counterPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.blue,
  },

  list: {
    gap: 10,
  },
  sampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    gap: 12,
  },
  sampleRowSelected: {
    borderColor: C.danger,
    backgroundColor: '#FFFDFD',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  checkboxActive: {
    backgroundColor: C.danger,
    borderColor: C.danger,
  },
  sampleDetails: {
    flex: 1,
    gap: 2,
  },
  sampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cloneText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: C.navy,
  },
  photoCount: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textMuted,
  },
  subText: {
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '500',
  },
  idText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#94A3B8',
  },

  emptyCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.navy,
  },
  emptySub: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: 'center',
  },

  actionSection: {
    gap: 10,
    marginTop: 8,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.danger,
    borderRadius: 16,
    height: 56,
    shadowColor: C.danger,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  deleteBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
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
});
