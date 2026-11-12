import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const C = {
  navy: '#0D1F3C',
  text: '#0D1F3C',
  textMuted: '#7A90B8',
  textLight: '#94A3B8',
  inputBg: '#F8FAFC',
  inputBorder: '#CBD5E1',
  blue: '#2563EB',
  danger: '#DC2626',
  white: '#FFFFFF',
};

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownFieldProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  error?: string;
}

export function DropdownField({
  label,
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  error,
}: DropdownFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Dropdown
        style={[
          styles.dropdown,
          error ? styles.dropdownError : null,
        ]}
        containerStyle={styles.dropdownContainer}
        itemContainerStyle={styles.itemContainer}
        activeColor="#EFF6FF"
        iconColor={C.navy}
        data={options}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        maxHeight={280}
        dropdownPosition="top"
        onChange={(item) => onValueChange(item.value)}
        placeholderStyle={styles.placeholder}
        selectedTextStyle={styles.selectedText}
        itemTextStyle={styles.itemText}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
    gap: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: C.navy,
  },

  dropdown: {
    height: 52,
    borderWidth: 1.5,
    borderColor: C.inputBorder,
    borderRadius: 14,
    backgroundColor: C.inputBg,
    paddingHorizontal: 16,
  },

  dropdownError: {
    borderColor: C.danger,
    backgroundColor: '#FEF2F2',
  },

  dropdownContainer: {
    borderRadius: 16,
    backgroundColor: C.white,
    borderColor: '#CBD5E1',
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 10,
  },

  itemContainer: {
    paddingVertical: 4,
  },

  placeholder: {
    fontSize: 15,
    color: C.textLight,
  },

  selectedText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.navy,
  },

  itemText: {
    fontSize: 14.5,
    color: C.navy,
    fontWeight: '600',
  },

  error: {
    fontSize: 12,
    color: C.danger,
    fontWeight: '600',
    marginTop: 2,
    marginLeft: 2,
  },
});
