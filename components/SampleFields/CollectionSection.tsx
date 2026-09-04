import { Control } from 'react-hook-form';

import { ControlledDropdownField } from '@/components/ControlledDropdownField';
import { ControlledFormField } from '@/components/ControlledFormField';
import { SectionCard } from '@/components/SectionCard';
import { flushOptions } from '@/constants/dropdownOptions';
import type { SampleFormInput } from '@/types/sample';

interface CollectionSectionProps {
  control: Control<SampleFormInput>;
}

export function CollectionSection({
  control,
}: CollectionSectionProps) {
  return (
    <SectionCard title="Collection Information">
      <ControlledDropdownField
        control={control}
        name="flush"
        label="Flush"
        options={flushOptions}
      />

      <ControlledFormField
        control={control}
        name="gardenName"
        label="Garden Name"
        placeholder="Enter garden name"
        returnKeyType="next"
      />

      <ControlledFormField
        control={control}
        name="sectionName"
        label="Section Name"
        placeholder="Enter section name"
        returnKeyType="next"
      />
    </SectionCard>
  );
}