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
  clearSelectedRecords,
  getExportSelectionData,
} from '@/services/exportService';
import type { Sample } from '@/types/sample';

export default function ClearSelectionScreen() {
  const [samplesWithImages, setSamplesWithImages] = useState<Sample[]>([]);
  const [samplesWithoutImages, setSamplesWithoutImages] = useState<Sample[]>([]);
  const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

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

  const allSamples = useMemo(
    () => [...samplesWithImages, ...samplesWithoutImages],
    [samplesWithImages, samplesWithoutImages],
  );

  const selectedSamples = useMemo(
    () => allSamples.filter((sample) => selectedSampleIds.includes(sample.id)),
    [allSamples, selectedSampleIds],
  );

  const allWithImagesSelected =
    samplesWithImages.length > 0 &&
    samplesWithImages.every((sample) => selectedSampleIds.includes(sample.id));

  const allWithoutImagesSelected =
    samplesWithoutImages.length > 0 &&
    samplesWithoutImages.every((sample) => selectedSampleIds.includes(sample.id));

  const handleToggleSample = useCallback((sampleId: string) => {
    setSelectedSampleIds((current) =>
      current.includes(sampleId)
        ? current.filter((id) => id !== sampleId)
        : [...current, sampleId],
    );
  }, []);

  const handleToggleSection = useCallback(
    (sampleIds: string[], value: boolean) => {
      setSelectedSampleIds((current) => {
        if (!value) {
          return current.filter((id) => !sampleIds.includes(id));
        }

        const next = new Set([...current, ...sampleIds]);
        return Array.from(next);
      });
    },
    [],
  );

  const confirmClear = useCallback(() => {
    Alert.alert(
      'Clear Selected Records',
      `This will permanently delete ${selectedSamples.length} selected sample(s) and any stored images linked to them. This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);

            try {
              const result = await clearSelectedRecords(selectedSamples);
              const remainingCount = allSamples.length - result.clearedCount;

              Alert.alert(
                'Records Cleared',
                `Cleared ${result.clearedCount} sample(s).\nRemaining: ${remainingCount} sample(s).`,
                [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ],
              );
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Failed to clear records.';
              Alert.alert('Error', message);
            } finally {
              setClearing(false);
            }
          },
        },
      ],
    );
  }, [allSamples.length, selectedSamples]);

  const handleClear = useCallback(() => {
    if (selectedSamples.length === 0) {
      Alert.alert('No samples selected', 'Select at least one sample to clear.');
      return;
    }

    confirmClear();
  }, [confirmClear, selectedSamples.length]);

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader
          title="Select Samples"
          subtitle="Choose which samples to clear"
        />

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Samples With Images</Text>
          <CheckboxRow
            label={`Select all (${samplesWithImages.length})`}
            value={allWithImagesSelected}
            onValueChange={(value) =>
              handleToggleSection(
                samplesWithImages.map((sample) => sample.id),
                value,
              )
            }
            disabled={loading || samplesWithImages.length === 0}
          />

          {samplesWithImages.length === 0 ? (
            <Text style={styles.emptyText}>No samples with images are available.</Text>
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
            value={allWithoutImagesSelected}
            onValueChange={(value) =>
              handleToggleSection(
                samplesWithoutImages.map((sample) => sample.id),
                value,
              )
            }
            disabled={loading || samplesWithoutImages.length === 0}
          />

          {samplesWithoutImages.length === 0 ? (
            <Text style={styles.emptyText}>All current samples have images.</Text>
          ) : (
            samplesWithoutImages.map((sample) => (
              <ExportSampleSelectionItem
                key={sample.id}
                sample={sample}
                selected={selectedSampleIds.includes(sample.id)}
                onToggle={() => handleToggleSample(sample.id)}
              />
            ))
          )}
        </View>

        <Text style={styles.helpText}>
          You can clear selected samples from either section. Samples with images will also remove
          their stored image files.
        </Text>

        <View style={styles.actions}>
          <ActionButton
            label={clearing ? 'Clearing...' : 'Clear Records'}
            onPress={handleClear}
            disabled={loading || clearing || selectedSamples.length === 0}
            variant="danger"
          />
          <ActionButton
            label="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            disabled={clearing}
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
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  sectionCard: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sectionTitle,
    fontWeight: '700',
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
