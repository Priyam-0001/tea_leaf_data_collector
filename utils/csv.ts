import type { Sample } from '@/types/sample';

const CSV_COLUMNS = [
  'sample_id',
  'clone_number',
  'tree_number',
  'leaf_number',
  'leaf_position',

  'meter_reading_1',
  'meter_reading_2',
  'meter_reading_3',

  'wet_lab_required',
  'wet_lab_completed',

  'flush',
  'flush_auto_detected',

  'garden_name',
  'section_name',

  'healthy',
  'wilting',
  'chlorosis',
  'scorching',
  'pest_damage',
  'disease',

  'gps_latitude',
  'gps_longitude',
  'gps_accuracy',

  'device_model',
  'device_manufacturer',
  'installation_id',
  'app_version',

  'image_count',
  'image_paths',

  'created_at',
  'updated_at',

  'remarks',
] as const;

function escapeCsvValue(
  value: string | number | boolean | null | undefined,
): string {
  if (value === null || value === undefined) return '';

  const stringValue = String(value);

  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function sampleToRow(sample: Sample): string[] {
  const imageNames = sample.images.map((image) =>
    image.split('/').pop() ?? 'unknown.jpg',
  );

  return [
    sample.id,
    sample.cloneNumber,
    sample.treeNumber,
    sample.leafNumber,
    sample.leafPosition,

    sample.meterReading1,
    sample.meterReading2,
    sample.meterReading3,

    sample.wetLabRequired,
    sample.wetLabCompleted,

    sample.flush,
    sample.flushAutoDetected,

    sample.gardenName,
    sample.sectionName,

    sample.healthy,
    sample.wilting,
    sample.chlorosis,
    sample.scorching,
    sample.pestDamage,
    sample.disease,

    sample.gpsLatitude,
    sample.gpsLongitude,
    sample.gpsAccuracy,

    sample.deviceModel,
    sample.deviceManufacturer,
    sample.installationId,
    sample.appVersion,

    imageNames.length,
    imageNames.join('|'),

    sample.createdAt,
    sample.updatedAt,

    sample.remarks,
  ].map(escapeCsvValue);
}

/** Convert samples array to CSV string with header row. */
export function samplesToCsv(samples: Sample[]): string {
  const header = CSV_COLUMNS.join(',');
  const rows = samples.map((sample) => sampleToRow(sample).join(','));

  return [header, ...rows].join('\n');
}

export function getCsvExportFilename(date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');

  const stamp = `${date.getFullYear()}_${pad(
    date.getMonth() + 1,
  )}_${pad(date.getDate())}`;

  return `tea_dataset_export_${stamp}.csv`;
}