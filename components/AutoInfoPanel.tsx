import { Clock, Cpu, MapPin } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

const C = {
  navy: '#0D1F3C',
  textMid: '#3D5A80',
  textMuted: '#64748B',
  bg: '#F8FAFC',
  border: '#E2E8F0',
  green: '#16A34A',
  greenBg: '#F0FDF4',
  greenBorder: '#BBF7D0',
};

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
  const hasGps = latitude !== null && longitude !== null;

  return (
    <View style={styles.panel}>
      {sampleIdPreview ? (
        <View style={styles.row}>
          <Text style={styles.label}>Sample ID</Text>
          <Text style={styles.valueMono}>{sampleIdPreview}</Text>
        </View>
      ) : null}

      <View style={styles.row}>
        <View style={styles.labelGroup}>
          <Clock size={14} color={C.textMuted} />
          <Text style={styles.label}>Timestamp</Text>
        </View>
        <Text style={styles.value}>{timestamp}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.labelGroup}>
          <MapPin size={14} color={hasGps ? C.green : C.textMuted} />
          <Text style={styles.label}>GPS Coordinates</Text>
        </View>
        <View style={[styles.gpsPill, hasGps ? styles.gpsActive : null]}>
          <Text style={[styles.gpsText, hasGps ? styles.gpsTextActive : null]}>
            {hasGps
              ? `${latitude?.toFixed(5)}°, ${longitude?.toFixed(5)}°`
              : 'Acquiring GPS…'}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.labelGroup}>
          <Cpu size={14} color={C.textMuted} />
          <Text style={styles.label}>Device & Version</Text>
        </View>
        <Text style={styles.value}>
          {deviceManufacturer} {deviceModel} • v{appVersion}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: C.bg,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: C.navy,
  },
  value: {
    fontSize: 12.5,
    color: C.textMid,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  valueMono: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#2563EB',
  },
  gpsPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gpsActive: {
    backgroundColor: C.greenBg,
    borderWidth: 1,
    borderColor: C.greenBorder,
  },
  gpsText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: C.textMuted,
  },
  gpsTextActive: {
    color: C.green,
  },
});
