/**
 * Date/time helpers for sample IDs and export filenames.
 */

/** Format: YYYYMMDD-HHMMSS */
export function formatSampleTimestamp(date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/** Format: YYYY_MM_DD for export filenames. */
export function formatExportDate(date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}_${pad(date.getMonth() + 1)}_${pad(date.getDate())}`;
}

/** ISO string for database timestamps. */
export function toIsoTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}
