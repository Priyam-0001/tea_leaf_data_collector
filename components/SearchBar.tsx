import { StyleSheet, TextInput, TextInputProps } from 'react-native';

import { COLORS, FONT_SIZES, INPUT_HEIGHT, SPACING } from '@/constants/theme';

interface SearchBarProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function SearchBar({ value, onChangeText, ...props }: SearchBarProps) {
  return (
    <TextInput
      accessibilityLabel="Search samples"
      placeholder="Search by ID, clone, tree, leaf..."
      placeholderTextColor={COLORS.textSecondary}
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: INPUT_HEIGHT,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.input,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
  },
});
