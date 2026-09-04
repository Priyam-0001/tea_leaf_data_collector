import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

import {
  COLORS,
  FONT_SIZES,
  INPUT_HEIGHT,
  RADIUS,
  SPACING,
} from '@/constants/theme';

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
      <Text style={styles.label}>
        {label}
      </Text>

      <Dropdown
        style={[
          styles.dropdown,
          error && styles.dropdownError,
        ]}
        containerStyle={styles.dropdownContainer}
        itemContainerStyle={styles.itemContainer}
        activeColor="#E8F5E9"
        iconColor={COLORS.text}
        data={options}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        maxHeight={320}
        onChange={(item) => onValueChange(item.value)}
        placeholderStyle={styles.placeholder}
        selectedTextStyle={styles.selectedText}
        itemTextStyle={styles.itemText}
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
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
  },

  label: {
    fontSize: FONT_SIZES.label,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },

  dropdown: {
    height: INPUT_HEIGHT,

    borderWidth: 2,
    borderColor: COLORS.border,

    borderRadius: RADIUS.sm,

    backgroundColor: COLORS.surface,

    paddingHorizontal: SPACING.md,
    // width: '50%',
    flex: 1
  },

  dropdownError: {
    borderColor: COLORS.danger,
  },

  dropdownContainer: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  itemContainer: {
    height: 56,
    justifyContent: 'center',
  },

  selectedText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.input,
  },

  placeholder: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.input,
  },

  itemText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.input,
  },

  error: {
    marginTop: SPACING.xs,
    color: COLORS.danger,
    fontSize: FONT_SIZES.helper,
  },
});