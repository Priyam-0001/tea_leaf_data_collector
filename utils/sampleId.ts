import * as Crypto from 'expo-crypto';

export interface SampleIdParts {
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

/** Generate full unique sample ID. */
export function generateUuid(): string {
  return Crypto.randomUUID();
}

/** Generate image filename for a given index (1-based). */
export function generateImageFileName( index: number ): string {
  const fileName = generateUuid();
  return `${fileName}-img${index}`;
}
