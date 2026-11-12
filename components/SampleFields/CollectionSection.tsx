import { MapPin } from 'lucide-react-native';
import { Control } from 'react-hook-form';
import { View } from 'react-native';

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
    <SectionCard
      title="Collection Information"
      badge="Location"
      icon={<MapPin size={20} color="#D97706" />}
    >
      <ControlledDropdownField
        control={control}
        name="flush"
        label="Flush Season"
        options={flushOptions}
      />

      <ControlledFormField
        control={control}
        name="gardenName"
        label="Garden Name"
        placeholder="e.g. Tocklai Experimental Garden"
        returnKeyType="next"
        requiredField={true}
      />

      <ControlledFormField
        control={control}
        name="sectionName"
        label="Section / Block Name"
        placeholder="e.g. Block A, Plot 3"
        returnKeyType="next"
      />
    </SectionCard>
  );
}
