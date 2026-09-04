import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { CheckboxRow } from '@/components/CheckboxRow';
import { ExportSampleSelectionItem } from '@/components/ExportSampleSelectionItem';
import { ScreenHeader } from '@/components/ScreenHeader';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import {
  exportRecordsToFile,
  getExportSelectionData,
} from '@/services/exportService';
import type { Sample } from '@/types/sample';

export default function ExportSelectionScreen() {
  const [samplesWithImages, setSamplesWithImages] = useState<Sample[]>([]);
  const [samplesWithoutImages, setSamplesWithoutImages] = useState<Sample[]>([]);
  const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadSamples = useCallback(async () => {
    setLoading(true);

    try {
      const result = await getExportSelectionData();
      setSamplesWithImages(result.samplesWithImages);
      setSamplesWithoutImages(result.samplesWithoutImages);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load samples.';
      Alert.alert('Load Failed', message, [
        {
          text: 'Back',
          onPress: () => router.back(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSamples();
  }, [loadSamples]);

  const selectedSamples = useMemo(
    () =>
      samplesWithImages.filter((sample) => selectedSampleIds.includes(sample.id)),
    [samplesWithImages, selectedSampleIds],
  );

  const allExportableSelected =
    samplesWithImages.length > 0 && selectedSampleIds.length === samplesWithImages.length;

  const handleToggleSample = useCallback((sampleId: string) => {
    setSelectedSampleIds((current) =>
      current.includes(sampleId)
        ? current.filter((id) => id !== sampleId)
        : [...current, sampleId],
    );
  }, []);

  const handleToggleAllWithImages = useCallback((value: boolean) => {
    setSelectedSampleIds(value ? samplesWithImages.map((sample) => sample.id) : []);
  }, [samplesWithImages]);

  const handleExport = useCallback(async () => {
    if (selectedSamples.length === 0) {
      Alert.alert('No samples selected', 'Select at least one sample with images to export.');
      return;
    }

    setExporting(true);

    try {
      const result = await exportRecordsToFile(selectedSamples);
      const leftToExportCount = samplesWithImages.length - selectedSamples.length;

      Alert.alert(
        'Export complete',
        `Exported ${result.recordCount} sample(s).\nLeft to export: ${leftToExportCount} sample(s).\nSamples without images: ${samplesWithoutImages.length}.\n\nFile: ${result.filePath}`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed.';
      if (!message.toLowerCase().includes('cancel')) {
        Alert.alert('Export failed', message);
      }
    } finally {
      setExporting(false);
    }
  }, [samplesWithImages.length, samplesWithoutImages.length, selectedSamples]);

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader
          title="Select Samples"
          subtitle="Choose which samples to export"
        />

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Samples With Images</Text>
          <CheckboxRow
            label={`Select all (${samplesWithImages.length})`}
            value={allExportableSelected}
            onValueChange={handleToggleAllWithImages}
            disabled={loading || samplesWithImages.length === 0}
          />

          {samplesWithImages.length === 0 ? (
            <Text style={styles.emptyText}>
              No samples with images are available for export.
            </Text>
          ) : (
            samplesWithImages.map((sample) => (
              <ExportSampleSelectionItem
                key={sample.id}
                sample={sample}
                selected={selectedSampleIds.includes(sample.id)}
                onToggle={() => handleToggleSample(sample.id)}
              />
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Samples Without Images</Text>
          <CheckboxRow
            label={`Select all (${samplesWithoutImages.length})`}
            value={false}
            onValueChange={() => undefined}
            disabled
          />

          {samplesWithoutImages.length === 0 ? (
            <Text style={styles.emptyText}>
              All current samples have images.
            </Text>
          ) : (
            samplesWithoutImages.map((sample) => (
              <ExportSampleSelectionItem
                key={sample.id}
                sample={sample}
                selected={false}
                disabled
                onToggle={() => undefined}
              />
            ))
          )}
        </View>

        <Text style={styles.helpText}>
          Samples without images are shown for reference only and cannot be exported.
        </Text>

        <View style={styles.actions}>
          <ActionButton
            label={exporting ? 'Exporting...' : 'Export'}
            onPress={handleExport}
            disabled={loading || exporting || selectedSamples.length === 0}
          />
          <ActionButton
            label="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            disabled={exporting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.md,
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  sectionCard: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sectionTitle,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
  },
  helpText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  actions: {
    gap: SPACING.md,
  },
});
