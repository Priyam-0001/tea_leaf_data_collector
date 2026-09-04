import { Control } from 'react-hook-form';

import { ControlledCheckbox } from '@/components/ControlledCheckbox';
import { ControlledFormField } from '@/components/ControlledFormField';
import { SectionCard } from '@/components/SectionCard';
import type { SampleFormInput } from '@/types/sample';

interface PlantHealthSectionProps {
  control: Control<SampleFormInput>;
}

export function PlantHealthSection({
  control,
}: PlantHealthSectionProps) {
  return (
    <SectionCard title="Plant Health">
      <ControlledCheckbox
        control={control}
        name="healthy"
        label="Healthy"
      />
      
      <ControlledCheckbox
        control={control}
        name="wilting"
        label="Wilting"
      />

      <ControlledCheckbox
        control={control}
        name="chlorosis"
        label="Chlorosis"
      />

      <ControlledCheckbox
        control={control}
        name="scorching"
        label="Scorching"
      />

      <ControlledCheckbox
        control={control}
        name="pestDamage"
        label="Pest Damage"
      />

      <ControlledCheckbox
        control={control}
        name="disease"
        label="Disease"
      />

      <ControlledFormField
        control={control}
        name="remarks"
        label="Remarks (Optional)"
        placeholder="Add any observations..."
        multiline
      />
    </SectionCard>
  );
}