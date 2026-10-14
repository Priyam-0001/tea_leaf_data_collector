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
  } else if (Number(sample.treeNumber.trim()) < 1) {
    return {
      valid: false,
      message: 'Invalid Tree Number.',
    };
  }

  if (!sample.leafNumber.trim()) {
    return {
      valid: false,
      message: 'Leaf Number is required.',
    };
  } else if (Number(sample.leafNumber.trim()) < 1) {
    return {
      valid: false,
      message: 'Invalid Leaf Number.',
    };
  }

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
    } else if (Number(reading.value.trim()) < 1 || Number(reading.value.trim()) > 2000) {
      return {
        valid: false,
        message: `${reading.name} must be between 1 to 2000.`,
      };
    }

    if (Number.isNaN(Number(reading.value))) {
      return {
        valid: false,
        message: `${reading.name} must be a valid number.`,
      };
    }
  }

  const hasIssues = sample.wilting || sample.chlorosis || sample.scorching || sample.pestDamage || sample.disease;

  if ((sample.healthy && hasIssues) || (!sample.healthy && !hasIssues)) {
    return {
      valid: false,
      message:
        'A sample must either be marked as "Healthy" OR have at least one health issue selected, but not both.',
    };
  }

  if (!sample.gardenName.trim()) {
    return {
      valid: false,
      message: 'Garden Name is required.',
    };
  }

  return {
    valid: true,
  };
}