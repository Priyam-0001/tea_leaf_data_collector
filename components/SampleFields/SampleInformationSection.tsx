import { Control } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { ControlledDropdownField } from '@/components/ControlledDropdownField';
import { ControlledFormField } from '@/components/ControlledFormField';
import { SectionCard } from '@/components/SectionCard';
import { cloneNumberOptions, leafPositionOptions } from '@/constants/dropdownOptions';
import type { SampleFormInput } from '@/types/sample';
import { Sprout } from 'lucide-react-native';

interface SampleInformationSectionProps {
  control: Control<SampleFormInput>;
}

export function SampleInformationSection({
  control,
}: SampleInformationSectionProps) {
  return (
    <SectionCard
      title="Sample Information"
      badge="Required"
      icon={<Sprout size={20} color="#2563EB" />}
    >
      <ControlledDropdownField
        control={control}
        name="cloneNumber"
        label="Clone Number"
        options={cloneNumberOptions}
        placeholder="Select clone number"
        requiredField
      />

      <View style={styles.twoCol}>
        <View style={styles.col}>
          <ControlledFormField
            control={control}
            name="treeNumber"
            label="Tree Number"
            placeholder="e.g. 12"
            keyboardType="number-pad"
            returnKeyType="next"
            requiredField={true}
          />
        </View>

        <View style={styles.col}>
          <ControlledFormField
            control={control}
            name="leafNumber"
            label="Leaf Number"
            placeholder="e.g. 3"
            keyboardType="number-pad"
            returnKeyType="next"
            requiredField={true}
          />
        </View>
      </View>

      <ControlledDropdownField
        control={control}
        name="leafPosition"
        label="Leaf Position"
        options={leafPositionOptions}
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  twoCol: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
});
