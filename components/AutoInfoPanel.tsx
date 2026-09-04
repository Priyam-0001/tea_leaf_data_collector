import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';

interface AutoInfoPanelProps {
  sampleIdPreview?: string;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  deviceManufacturer: string;
  deviceModel: string;
  installationId: string;
  appVersion: string;
}

export function AutoInfoPanel({
  sampleIdPreview,
  timestamp,
  latitude,
  longitude,
  deviceManufacturer,
  deviceModel,
  installationId,
  appVersion,
}: AutoInfoPanelProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>Automatic Fields</Text>
      {sampleIdPreview ? (
        <Text style={styles.row}>
          <Text style={styles.label}>Sample ID: </Text>
          {sampleIdPreview}
        </Text>
      ) : null}
      <Text style={styles.row}>
        <Text style={styles.label}>Timestamp: </Text>
        {timestamp}
      </Text>
      <Text style={styles.row}>
        <Text style={styles.label}>GPS: </Text>
        {latitude !== null && longitude !== null
          ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          : 'Not available'}
      </Text>
      <Text style={styles.row}>
        <Text style={styles.label}>Device: </Text>
        {deviceManufacturer} {deviceModel}
      </Text>
      <Text style={styles.row}>
        <Text style={styles.label}>Installation ID: </Text>
        {installationId}
      </Text>
      <Text style={styles.row}>
        <Text style={styles.label}>App Version: </Text>
        {appVersion}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    backgroundColor: '#EEEEEE',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  heading: {
    fontSize: FONT_SIZES.label,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  row: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  label: {
    fontWeight: '700',
    color: COLORS.text,
  },
});
