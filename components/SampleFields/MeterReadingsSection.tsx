import { Control } from 'react-hook-form';

import { ControlledFormField } from '@/components/ControlledFormField';
import { SectionCard } from '@/components/SectionCard';
import type { SampleFormInput } from '@/types/sample';

interface MeterReadingsSectionProps {
  control: Control<SampleFormInput>;
}

export function MeterReadingsSection({
  control,
}: MeterReadingsSectionProps) {
  return (
    <SectionCard title="Chlorophyll Meter Readings">
      <ControlledFormField
        control={control}
        name="meterReading1"
        label="Reading 1"
        placeholder="Enter first meter reading"
        keyboardType="decimal-pad"
        returnKeyType="next"
      />

      <ControlledFormField
        control={control}
        name="meterReading2"
        label="Reading 2"
        placeholder="Enter second meter reading"
        keyboardType="decimal-pad"
        returnKeyType="next"
      />

      <ControlledFormField
        control={control}
        name="meterReading3"
        label="Reading 3"
        placeholder="Enter third meter reading"
        keyboardType="decimal-pad"
        returnKeyType="next"
      />
    </SectionCard>
  );
}