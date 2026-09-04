import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { getExportCounts } from '@/services/exportService';

export default function ExportScreen() {
  const [recordCount, setRecordCount] = useState(0);
  const [exportableCount, setExportableCount] = useState(0);

  const loadCounts = useCallback(async () => {
    try {
      const counts = await getExportCounts();
      setRecordCount(counts.totalCount);
      setExportableCount(counts.exportableCount);
    } catch {
      setRecordCount(0);
      setExportableCount(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCounts();
    }, [loadCounts])
  );

  const handleExport = useCallback(async () => {
    if (recordCount === 0) {
      Alert.alert('No records', 'There are no samples to export yet.');
      return;
    }

    router.push('/export-selection' as never);
  }, [recordCount]);

  const handleClear = useCallback(() => {
    if (recordCount === 0) {
      Alert.alert('No records', 'There are no samples to clear yet.');
      return;
    }

    router.push('/clear-selection' as never);
  }, [recordCount]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.page}>
        <ScrollView contentContainerStyle={styles.container}>
          <ScreenHeader title="Export Records" subtitle="Generate CSV from local database" />

          <View style={styles.card}>
            <Text style={styles.statLabel}>Total samples</Text>
            <Text style={styles.statValue}>{recordCount}</Text>
            <Text style={styles.statLabel}>Ready to export</Text>
            <Text style={styles.statSubValue}>{exportableCount}</Text>
            <Text style={styles.statLabel}>Left to export</Text>
            <Text style={styles.statSubValue}>{recordCount - exportableCount}</Text>
            <Text style={styles.help}>
              Tap export to choose the samples you want. Only samples with images can be selected
              for export. On Android, you will be asked to choose a folder using the system file
              picker (Storage Access Framework).
            </Text>
          </View>

          <ActionButton
            label="Export Records"
            onPress={handleExport}
          />
          <ActionButton
            label="Clear Records"
            onPress={handleClear}
            variant="danger"
          />
          <ActionButton label="Back" onPress={() => router.back()} variant="secondary" />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
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
    paddingBottom: SPACING.md,
  },
  card: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  statLabel: {
    fontSize: FONT_SIZES.label,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  statSubValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  help: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 26,
  },
});
