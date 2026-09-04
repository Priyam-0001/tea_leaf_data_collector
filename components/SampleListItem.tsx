import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import type { Sample } from '@/types/sample';

interface SampleListItemProps {
  sample: Sample;
  selected?: boolean;
  onPress: () => void;
}

export function SampleListItem({ sample, selected = false, onPress }: SampleListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.item, selected ? styles.itemSelected : null]}
    >
      <Text style={styles.id} numberOfLines={1}>
        {sample.id}
      </Text>
      <Text style={styles.meta}>
        {sample.cloneNumber} · Tree {sample.treeNumber} · Leaf {sample.leafNumber}
      </Text>
      <Text style={styles.meta}>
        {sample.images.length} image(s) · {new Date(sample.createdAt).toLocaleString()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  itemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E9',
  },
  id: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  meta: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
