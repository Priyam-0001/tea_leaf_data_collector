import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { BUTTON_HEIGHT, COLORS, FONT_SIZES, SPACING } from '@/constants/theme';

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'guide';
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  icon,
}: ActionButtonProps) {
  const VARIANT_COLORS = {
    danger: COLORS.danger,
    secondary: COLORS.surface,
    tertiary: COLORS.tertiary,
    primary: COLORS.primary,
    guide: '#2563EB', // Distinct vibrant royal blue for training & guide
  };

  const backgroundColor = VARIANT_COLORS[variant] || COLORS.primary;

  const textColor = variant === 'secondary' ? COLORS.text : '#FFFFFF';
  const borderColor =
    variant === 'secondary'
      ? COLORS.border
      : variant === 'guide'
      ? '#1D4ED8'
      : '#FFFFFF';

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
      <View style={styles.contentRow}>
        {icon}
        <Text style={[styles.label, { color: disabled ? '#F5F5F5' : textColor }]}>{label}</Text>
      </View>
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
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontSize: FONT_SIZES.button,
    fontWeight: '700',
    textAlign: 'center',
  },
});
