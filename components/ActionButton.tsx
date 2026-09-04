import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { BUTTON_HEIGHT, COLORS, FONT_SIZES, SPACING } from '@/constants/theme';

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
}

export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: ActionButtonProps) {
  const backgroundColor =
    variant === 'danger'
      ? COLORS.danger
      : variant === 'secondary'
        ? COLORS.surface
        : COLORS.primary;

  const textColor = variant === 'secondary' ? COLORS.text : '#FFFFFF';
  const borderColor = variant === 'secondary' ? COLORS.border : backgroundColor;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled ? COLORS.disabled : backgroundColor,
          borderColor,
          opacity: pressed && !disabled ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: disabled ? '#F5F5F5' : textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: BUTTON_HEIGHT,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    width: '100%',
  },
  label: {
    fontSize: FONT_SIZES.button,
    fontWeight: '700',
    textAlign: 'center',
  },
});
