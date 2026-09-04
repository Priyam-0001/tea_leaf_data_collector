import { getDeviceInfo } from '@/services/deviceService';
import { generateSampleId, sanitizeDeviceModel } from '@/utils/sampleId';

export interface BuildSampleIdParams {
  installationId: string;
}

/** Build a unique sample ID using current device model and timestamp. */
export async function buildSampleId(): Promise<string> {
  const device = await getDeviceInfo();
  return generateSampleId({
    installationId: device.installationId,
    deviceModel: sanitizeDeviceModel(device.model),
  });
}
