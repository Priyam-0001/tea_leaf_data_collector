import { router, useFocusEffect } from 'expo-router';
import { Check, CheckSquare, Download, FileSpreadsheet, Square } from 'lucide-react-native';
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
  exportRecordsToFile,
  getExportSelectionData,
} from '@/services/exportService';
import type { Sample } from '@/types/sample';

const C = {
  navy: '#0D1F3C',
  navyMid: '#1E3A5F',
  page: '#F0F5FF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  blue: '#2563EB',
  green: '#16A34A',
  greenLight: '#F0FDF4',
  greenBorder: '#BBF7D0',
  btnPrimary: '#1D3557',
  btnShadow: '#0A1A30',
  textMuted: '#64748B',
};

export default function ExportSelectionScreen() {
  const [samplesWithImages, setSamplesWithImages] = useState<Sample[]>([]);
  const [samplesWithoutImages, setSamplesWithoutImages] = useState<Sample[]>([]);
  const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

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

  const selectedSamples = useMemo(
    () =>
      samplesWithImages.filter((sample) => selectedSampleIds.includes(sample.id)),
    [samplesWithImages, selectedSampleIds]
  );

  const handleToggleSample = useCallback((sampleId: string) => {
    setSelectedSampleIds((current) =>
      current.includes(sampleId)
        ? current.filter((id) => id !== sampleId)
        : [...current, sampleId]
    );
  }, []);

  const handleToggleAll = useCallback(() => {
    if (selectedSampleIds.length === samplesWithImages.length) {
      setSelectedSampleIds([]);
    } else {
      setSelectedSampleIds(samplesWithImages.map((s) => s.id));
    }
  }, [samplesWithImages, selectedSampleIds]);

  const handleExport = useCallback(async () => {
    if (selectedSamples.length === 0) {
      Alert.alert('No Selection', 'Select at least one sample with photos to export.');
      return;
    }

    setExporting(true);

    try {
      const result = await exportRecordsToFile(selectedSamples);
      const leftToExportCount = samplesWithImages.length - selectedSamples.length;

      Alert.alert(
        'Export Complete 🎉',
        `Successfully exported ${result.recordCount} sample(s).\n\nLeft to export: ${leftToExportCount} sample(s).\nDestination: ${result.filePath}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed.';
      if (!message.toLowerCase().includes('cancel')) {
        Alert.alert('Export Failed', message);
      }
    } finally {
      setExporting(false);
    }
  }, [samplesWithImages.length, selectedSamples]);

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Select Samples to Export"
          subtitle="Choose which samples with photos to export to CSV"
        />

        {/* Selection Toolbar */}
        {samplesWithImages.length > 0 ? (
          <View style={styles.selectionBar}>
            <TouchableOpacity
              style={styles.toggleAllBtn}
              onPress={handleToggleAll}
              activeOpacity={0.7}
            >
              {selectedSampleIds.length === samplesWithImages.length ? (
                <CheckSquare size={18} color={C.navy} />
              ) : (
                <Square size={18} color={C.textMuted} />
              )}
              <Text style={styles.toggleAllText}>
                {selectedSampleIds.length === samplesWithImages.length
                  ? 'Deselect All'
                  : 'Select All Samples'}
              </Text>
            </TouchableOpacity>

            <View style={styles.counterPill}>
              <Text style={styles.counterText}>
                {selectedSampleIds.length} / {samplesWithImages.length} selected
              </Text>
            </View>
          </View>
        ) : null}

        {/* Samples List */}
        {samplesWithImages.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {loading ? 'Loading exportable samples…' : 'No Exportable Samples'}
            </Text>
            <Text style={styles.emptySub}>
              {loading
                ? 'Reading local SQLite database records…'
                : 'Only samples with attached photos can be selected for export.'}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {samplesWithImages.map((sample) => {
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
                      <View style={styles.cloneBadge}>
                        <Text style={styles.cloneBadgeText}>
                          Clone: {sample.cloneNumber || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.photoPill}>
                        <FileSpreadsheet size={12} color={C.green} />
                        <Text style={styles.photoCountText}>
                          {sample.images?.length || 0} photos
                        </Text>
                      </View>
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
              styles.primaryBtn,
              (selectedSamples.length === 0 || exporting) && styles.btnDisabled,
            ]}
            onPress={handleExport}
            disabled={selectedSamples.length === 0 || exporting}
            activeOpacity={0.85}
          >
            <Download size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>
              {exporting
                ? 'Packaging CSV Export…'
                : `Export (${selectedSamples.length}) Record(s)`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>Back to Export Info</Text>
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
    borderColor: C.blue,
    backgroundColor: '#FAFDFB',
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
    backgroundColor: C.navy,
    borderColor: C.navy,
  },
  sampleDetails: {
    flex: 1,
    gap: 3,
  },
  sampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cloneBadge: {
    backgroundColor: C.navy,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cloneBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  photoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.greenLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  photoCountText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: C.green,
  },
  subText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
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
  primaryBtn: {
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
  primaryBtnText: {
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
