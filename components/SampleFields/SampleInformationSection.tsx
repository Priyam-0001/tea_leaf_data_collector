import { Control } from 'react-hook-form';

import { ControlledDropdownField } from '@/components/ControlledDropdownField';
import { ControlledFormField } from '@/components/ControlledFormField';
import { SectionCard } from '@/components/SectionCard';
import { leafPositionOptions } from '@/constants/dropdownOptions';
import type { SampleFormInput } from '@/types/sample';

interface SampleInformationSectionProps {
  control: Control<SampleFormInput>;
}

export function SampleInformationSection({
  control,
}: SampleInformationSectionProps) {
  return (
    <SectionCard title="Sample Information">
      <ControlledFormField
        control={control}
        name="cloneNumber"
        label="Clone Number"
        placeholder="Enter clone number"
        autoCapitalize="characters"
        returnKeyType="next"
      />

      <ControlledFormField
        control={control}
        name="treeNumber"
        label="Tree Number"
        placeholder="Enter tree number"
        keyboardType="number-pad"
        returnKeyType="next"
      />

      <ControlledFormField
        control={control}
        name="leafNumber"
        label="Leaf Number"
        placeholder="Enter leaf number"
        keyboardType="number-pad"
        returnKeyType="next"
      />

      <ControlledDropdownField
        control={control}
        name="leafPosition"
        label="Leaf Position"
        options={leafPositionOptions}
      />
    </SectionCard>
  );
}