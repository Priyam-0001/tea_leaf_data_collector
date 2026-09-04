import { Control, Controller } from 'react-hook-form';

import { DropdownField } from '@/components/DropdownField';
import type { SampleFormInput } from '@/types/sample';

interface DropdownOption<T extends string> {
  label: string;
  value: T;
}

type DropdownFieldName =
  | 'leafPosition'
  | 'flush';

interface ControlledDropdownFieldProps<
  TValue extends string,
> {
  control: Control<SampleFormInput>;
  name: DropdownFieldName;
  label: string;
  options: DropdownOption<TValue>[];
}

export function ControlledDropdownField<
  TValue extends string,
>({
  control,
  name,
  label,
  options,
}: ControlledDropdownFieldProps<TValue>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <DropdownField
            label={label}
            value={field.value}
            options={options}
            onValueChange={(value) => {
              field.onChange(value);
            }}
            error={fieldState.error?.message}
          />
        );
      }}
    />
  );
}