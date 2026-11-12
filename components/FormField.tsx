import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

const C = {
  navy: '#0D1F3C',
  text: '#0D1F3C',
  textMid: '#3D5A80',
  textMuted: '#7A90B8',
  textLight: '#94A3B8',
  inputBg: '#F8FAFC',
  inputBorder: '#CBD5E1',
  inputFocusBorder: '#2563EB',
  danger: '#DC2626',
  white: '#FFFFFF',
};

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  requiredField?: boolean;
}

export function FormField({
  label,
  error,
  style,
  editable = true,
  multiline,
  requiredField = false,
  ...inputProps
}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {requiredField ? <Text style={styles.requiredMark}>*</Text> : null}
      </View>

      <TextInput
        {...inputProps}
        editable={editable}
        multiline={multiline}
        placeholderTextColor={C.textLight}
        style={[
          styles.input,
          multiline && styles.multiline,
          !editable && styles.disabled,
          error ? styles.inputError : null,
          style,
        ]}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: C.navy,
    letterSpacing: 0.1,
  },

  requiredMark: {
    fontSize: 14,
    fontWeight: '800',
    color: C.danger,
  },

  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: C.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: C.text,
    backgroundColor: C.inputBg,
  },

  multiline: {
    minHeight: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },

  disabled: {
    opacity: 0.6,
    backgroundColor: '#F1F5F9',
  },

  inputError: {
    borderColor: C.danger,
    backgroundColor: '#FEF2F2',
  },

  error: {
    fontSize: 12,
    color: C.danger,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 2,
  },
});
