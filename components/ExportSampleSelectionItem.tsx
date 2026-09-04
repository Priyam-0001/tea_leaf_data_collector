import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import type { Sample } from '@/types/sample';

interface ExportSampleSelectionItemProps {
  sample: Sample;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export function ExportSampleSelectionItem({
  sample,
  selected,
  disabled = false,
  onToggle,
}: ExportSampleSelectionItemProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onToggle}
      style={[
        styles.item,
        selected ? styles.itemSelected : null,
        disabled ? styles.itemDisabled : null,
      ]}
    >
      <View style={styles.headerRow}>
        <View
          style={[
            styles.checkbox,
            selected ? styles.checkboxSelected : null,
            disabled ? styles.checkboxDisabled : null,
          ]}
        >
          {selected ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>
        <Text style={[styles.id, disabled ? styles.textDisabled : null]}>
          {sample.id}
        </Text>
      </View>

      <Text style={[styles.meta, disabled ? styles.textDisabled : null]}>
        Clone: {sample.cloneNumber || '-'}
      </Text>
      <Text style={[styles.meta, disabled ? styles.textDisabled : null]}>
        Tree: {sample.treeNumber || '-'}
      </Text>
      <Text style={[styles.meta, disabled ? styles.textDisabled : null]}>
        Leaf: {sample.leafNumber || '-'}
      </Text>
      <Text style={[styles.meta, disabled ? styles.textDisabled : null]}>
        Created on: {new Date(sample.createdAt).toLocaleString() || '-'}
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
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  itemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E9',
  },
  itemDisabled: {
    backgroundColor: COLORS.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: COLORS.text,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxDisabled: {
    borderColor: COLORS.disabled,
    backgroundColor: COLORS.background,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  id: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    color: COLORS.text,
  },
  meta: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
  },
  textDisabled: {
    color: COLORS.textSecondary,
  },
});
