import { Control, Controller, FieldPath } from 'react-hook-form';
import { TextInputProps } from 'react-native';

import { FormField } from '@/components/FormField';
import type { SampleFormInput } from '@/types/sample';

interface ControlledFormFieldProps extends TextInputProps {
  control: Control<SampleFormInput>;
  name: FieldPath<SampleFormInput>;
  label: string;
}

export function ControlledFormField({
  control,
  name,
  label,
  ...inputProps
}: ControlledFormFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          value={String(field.value ?? '')}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
          {...inputProps}
        />
      )}
    />
  );
}