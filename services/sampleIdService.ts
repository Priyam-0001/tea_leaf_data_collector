import { generateUuid } from '@/utils/sampleId';

export interface BuildSampleIdParams {
  installationId: string;
}

/** Build a unique sample ID using current device model and timestamp. */
export async function buildSampleId(): Promise<string> {
  return generateUuid();
}
