import { router, useFocusEffect } from 'expo-router';
import { Download, FileSpreadsheet, Info, Layers } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { getExportCounts } from '@/services/exportService';

const C = {
  navy: '#0D1F3C',
  navyMid: '#1E3A5F',
  page: '#F0F5FF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  blue: '#2563EB',
  blueLight: '#EFF6FF',
  blueBorder: '#BFDBFE',
  green: '#16A34A',
  greenLight: '#F0FDF4',
  greenBorder: '#BBF7D0',
  btnPrimary: '#1D3557',
  btnShadow: '#0A1A30',
  textMuted: '#64748B',
};

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
      Alert.alert('No Records', 'There are no samples available in local storage to export.');
      return;
    }
    router.push('/export-selection' as never);
  }, [recordCount]);

  const remainingCount = Math.max(0, recordCount - exportableCount);

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Export Records"
          subtitle="Generate and save CSV files with sample leaf data"
        />

        {/* Overview Stats Card */}
        <View style={styles.metricsCard}>
          <View style={styles.metricItem}>
            <View style={styles.metricIconWrap}>
              <Layers size={18} color={C.navy} />
            </View>
            <Text style={styles.metricValue}>{recordCount}</Text>
            <Text style={styles.metricLabel}>Total Samples</Text>
          </View>

          <View style={styles.dividerV} />

          <View style={styles.metricItem}>
            <View style={[styles.metricIconWrap, { backgroundColor: C.greenLight }]}>
              <FileSpreadsheet size={18} color={C.green} />
            </View>
            <Text style={[styles.metricValue, { color: C.green }]}>{exportableCount}</Text>
            <Text style={styles.metricLabel}>Ready with Photos</Text>
          </View>

          <View style={styles.dividerV} />

          <View style={styles.metricItem}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#F1F5F9' }]}>
              <Layers size={18} color={C.textMuted} />
            </View>
            <Text style={[styles.metricValue, { color: C.textMuted }]}>{remainingCount}</Text>
            <Text style={styles.metricLabel}>Without Photos</Text>
          </View>
        </View>

        {/* Guidance Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Info size={18} color={C.blue} />
            <Text style={styles.infoTitle}>Export Instructions</Text>
          </View>
          <Text style={styles.infoText}>
            • Tap <Text style={styles.bold}>Proceed to Selection</Text> to choose specific samples to export.
          </Text>
          <Text style={styles.infoText}>
            • Only samples with images are packaged for export archives.
          </Text>
          <Text style={styles.infoText}>
            • On Android devices, you will choose an export destination folder using the system file picker (Storage Access Framework).
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={[styles.primaryBtn, recordCount === 0 && styles.btnDisabled]}
            onPress={handleExport}
            disabled={recordCount === 0}
            activeOpacity={0.85}
          >
            <Download size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Proceed to Selection</Text>
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
    gap: 16,
  },

  metricsCard: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: C.navy,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    textAlign: 'center',
  },
  dividerV: {
    width: 1,
    height: 48,
    backgroundColor: '#F1F5F9',
  },

  infoCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: C.blueBorder,
    gap: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: C.navy,
  },
  infoText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
    color: C.navy,
  },

  actionGroup: {
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
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  btnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
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
