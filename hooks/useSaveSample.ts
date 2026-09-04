import { useCallback, useState } from 'react';

import { sampleRepository } from '@/database/sampleRepository';
import { getDeviceInfo } from '@/services/deviceService';
import { buildSampleId } from '@/services/sampleIdService';
import type { Sample, SampleFormInput } from '@/types/sample';
import type { GpsCoordinates } from '@/services/locationService';

interface SaveSampleParams extends SampleFormInput {
  images: string[];
  coordinates: GpsCoordinates | null;
}

export function useSaveSample() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveSample = useCallback(async (input: SaveSampleParams): Promise<Sample | null> => {
    setSaving(true);
    setError(null);

    try {
      const { coordinates, ...sampleInput } = input;
      const device = await getDeviceInfo();
      const sampleId = await buildSampleId();

      const sample = await sampleRepository.create({
        ...sampleInput,

        meterReading1: parseFloat(input.meterReading1),
        meterReading2: parseFloat(input.meterReading2),
        meterReading3: parseFloat(input.meterReading3),

        id: sampleId,

        gpsLatitude: coordinates?.latitude ?? null,
        gpsLongitude: coordinates?.longitude ?? null,
        gpsAccuracy: coordinates?.accuracy ?? null,

        deviceManufacturer: device.manufacturer,
        deviceModel: device.model,
        osName: device.osName,
        osVersion: device.osVersion,
        installationId: device.installationId,
        appVersion: device.appVersion,

        wetLabCompleted: input.wetLabCompleted,
      });

      return sample;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save sample.';
      setError(message);
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  return { saveSample, saving, error };
}
