import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import {
  COLORS,
  FONT_SIZES,
  INPUT_HEIGHT,
  RADIUS,
  SPACING,
} from '@/constants/theme';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormField({
  label,
  error,
  style,
  editable = true,
  multiline,
  ...inputProps
}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        {...inputProps}
        editable={editable}
        multiline={multiline}
        placeholderTextColor={COLORS.textSecondary}
        style={[
          styles.input,
          multiline && styles.multiline,
          !editable && styles.disabled,
          error && styles.inputError,
          style,
        ]}
      />

      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },

  label: {
    fontSize: FONT_SIZES.label,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },

  input: {
    minHeight: INPUT_HEIGHT,

    borderWidth: 2,
    borderColor: COLORS.border,

    borderRadius: RADIUS.sm,

    paddingHorizontal: SPACING.md,

    fontSize: FONT_SIZES.input,

    color: COLORS.text,

    backgroundColor: COLORS.surface,
  },

  multiline: {
    minHeight: 120,

    paddingTop: SPACING.sm,

    textAlignVertical: 'top',
  },

  disabled: {
    backgroundColor: COLORS.background,
    color: COLORS.textSecondary,
  },

  inputError: {
    borderColor: COLORS.danger,
  },

  error: {
    marginTop: SPACING.xs,
    color: COLORS.danger,
    fontSize: FONT_SIZES.helper,
  },
});