import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import type { Sample } from '@/types/sample';

interface SampleSummaryCardProps {
  sample: Sample;
  onPress: () => void;
}

function formatCreatedDate(createdAt: string) {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? createdAt : date.toLocaleString();
}

export function SampleSummaryCard({
  sample,
  onPress,
}: SampleSummaryCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.cardPressed : null,
      ]}
    >
      <View style={styles.row}>
        <Text style={styles.label}>Sample ID: {sample.id}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.value}>Clone Number: {sample.cloneNumber || '-'}</Text>
        <Text style={{fontWeight: 'bold'}}>|</Text>
        <Text style={styles.value}>Tree Number: {sample.treeNumber || '-'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.value}>Leaf Number: {sample.leafNumber || '-'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.value}>Created Date: {formatCreatedDate(sample.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  cardPressed: {
    opacity: 0.85,
  },
  row: {
    gap: SPACING.xs,
    flexDirection: 'row',
  },
  label: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    color: COLORS.text,
  },
  value: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
