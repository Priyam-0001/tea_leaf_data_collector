import { Control, Controller, FieldPath } from 'react-hook-form';

import { CheckboxRow } from '@/components/CheckboxRow';
import type { SampleFormInput } from '@/types/sample';

interface ControlledCheckboxProps {
  control: Control<SampleFormInput>;
  name: FieldPath<SampleFormInput>;
  label: string;
}

export function ControlledCheckbox({
  control,
  name,
  label,
}: ControlledCheckboxProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <CheckboxRow
          label={label}
          value={Boolean(field.value)}
          onValueChange={field.onChange}
        />
      )}
    />
  );
}