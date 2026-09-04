/**
 * Sample ID and image naming utilities.
 * ID format: <clone>-T<tree>-L<leaf>-<deviceModel>-<timestamp>
 * Image format: <clone>-T<tree>-L<leaf>-img<n>.jpg
 */

import { formatSampleTimestamp } from './dateFormat';

export interface SampleIdParts {
  installationId: string;
  deviceModel: string;
  timestamp?: Date;
}

/** Normalize clone number (e.g. "v1" -> "TV1"). */
export function normalizeCloneNumber(value: string): string {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return '';
  return trimmed.startsWith('T') ? trimmed : `T${trimmed}`;
}

/** Pad tree number with T prefix. */
export function formatTreeSegment(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return `T${digits}`;
}

/** Pad leaf number with L prefix and zero padding. */
export function formatLeafSegment(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return `L${digits.padStart(2, '0')}`;
}

/** Sanitize device model for use in filenames and IDs. */
export function sanitizeDeviceModel(model: string): string {
  return model
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toUpperCase() || 'UNKNOWN';
}

/** Build the shared prefix used in IDs and image names. */
// export function buildSamplePrefix(parts: Omit<SampleIdParts, 'deviceModel' | 'timestamp'>): string {
//   const clone = normalizeCloneNumber(parts.cloneNumber);
//   const tree = formatTreeSegment(parts.treeNumber);
//   const leaf = formatLeafSegment(parts.leafNumber);
//   if (!clone || !tree || !leaf) return '';
//   return `${clone}-${tree}-${leaf}`;
// }

/** Generate full unique sample ID. */
export function generateSampleId(parts: SampleIdParts): string {
  // const prefix = buildSamplePrefix(parts);
  const installationId = parts.installationId;
  const device = sanitizeDeviceModel(parts.deviceModel);
  const timestamp = formatSampleTimestamp(parts.timestamp ?? new Date());
  return `${installationId}-${device}-${timestamp}`;
}

/** Generate image filename for a given index (1-based). */
export function generateImageFileName(
  parts: Omit<SampleIdParts, 'deviceModel'>,
  index: number,
): string {
  // const prefix = buildSamplePrefix(parts);
  const installationId = parts.installationId;
  const timestamp = formatSampleTimestamp(parts.timestamp ?? new Date())
  return `${installationId}-${timestamp}-img${index}`;
}
