import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const C = {
  navy: '#0D1F3C',
  navyMid: '#1E3A5F',
  text: '#0D1F3C',
  textSecondary: '#64748B',
  inputBg: '#F8FAFC',
  border: '#CBD5E1',
  blue: '#2563EB',
  btnPrimary: '#1D3557',
  white: '#FFFFFF',
};

interface CheckboxRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function CheckboxRow({
  label,
  value,
  onValueChange,
  disabled = false,
}: CheckboxRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [
        styles.row,
        value ? styles.rowActive : null,
        pressed ? styles.rowPressed : null,
        disabled ? styles.rowDisabled : null,
      ]}
    >
      <View
        style={[
          styles.box,
          value ? styles.boxChecked : null,
          disabled ? styles.boxDisabled : null,
        ]}
      >
        {value ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
      </View>
      <Text style={[styles.label, value ? styles.labelActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: C.inputBg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  rowActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  rowPressed: {
    opacity: 0.8,
  },
  rowDisabled: {
    opacity: 0.5,
  },

  box: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
  },
  boxChecked: {
    backgroundColor: C.btnPrimary,
    borderColor: C.btnPrimary,
  },
  boxDisabled: {
    borderColor: '#CBD5E1',
    backgroundColor: '#E2E8F0',
  },

  label: {
    flex: 1,
    fontSize: 14.5,
    color: C.navyMid,
    fontWeight: '600',
  },
  labelActive: {
    color: C.navy,
    fontWeight: '700',
  },
});
