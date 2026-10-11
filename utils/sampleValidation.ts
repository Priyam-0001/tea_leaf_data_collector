import type { SampleFormInput } from '@/types/sample';

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateSample(
  sample: SampleFormInput,
): ValidationResult {
  if (!sample.cloneNumber.trim()) {
    return {
      valid: false,
      message: 'Clone Number is required.',
    };
  }

  if (!sample.treeNumber.trim()) {
    return {
      valid: false,
      message: 'Tree Number is required.',
    };
  }

  if (!sample.leafNumber.trim()) {
    return {
      valid: false,
      message: 'Leaf Number is required.',
    };
  }

  if (!sample.gardenName.trim()) {
    return {
      valid: false,
      message: 'Garden Name is required.',
    };
  }

  if (!sample.sectionName.trim()) {
    return {
      valid: false,
      message: 'Section Name is required.',
    };
  }

  // Validate plant health selection
  const healthOptions = [
    sample.healthy,
    sample.wilting,
    sample.chlorosis,
    sample.scorching,
    sample.pestDamage,
    sample.disease,
  ];

  if (!healthOptions.some(Boolean)) {
    return {
      valid: false,
      message:
        'Please select at least one plant health option (Healthy or a health issue).',
    };
  }

  // Prevent selecting Healthy alongside other health issues
  if (
    sample.healthy &&
    (
      sample.wilting ||
      sample.chlorosis ||
      sample.scorching ||
      sample.pestDamage ||
      sample.disease
    )
  ) {
    return {
      valid: false,
      message:
        'A sample cannot be marked as "Healthy" and have plant health issues at the same time. Please uncheck either "Healthy" or the selected health issue(s).',
    };
  }

  // Validate meter readings
  const readings = [
    {
      name: 'Meter Reading 1',
      value: sample.meterReading1,
    },
    {
      name: 'Meter Reading 2',
      value: sample.meterReading2,
    },
    {
      name: 'Meter Reading 3',
      value: sample.meterReading3,
    },
  ];

  for (const reading of readings) {
    if (!reading.value.trim()) {
      return {
        valid: false,
        message: `${reading.name} is required.`,
      };
    }

    if (Number.isNaN(Number(reading.value))) {
      return {
        valid: false,
        message: `${reading.name} must be a valid number.`,
      };
    }
  }

  return {
    valid: true,
  };
}