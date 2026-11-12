/**
 * useCloneAutoFill
 *
 * Implements "Smart Clone Auto-Fill" logic:
 *  - When user picks a NEW clone → all fields blank (normal behavior)
 *  - When user picks the SAME clone as the most recently saved sample →
 *    randomly auto-fill ~70% of the eligible fields (never chlorophyll readings)
 *
 * Data is persisted in AsyncStorage under the key:
 *   "paatsutra:lastSamplePerClone"
 *
 * Usage in AddSampleScreen:
 *   const { getAutoFillValues, saveCloneSnapshot } = useCloneAutoFill();
 *   // On clone change → call getAutoFillValues(cloneNumber)
 *   // After successful save → call saveCloneSnapshot(cloneNumber, formValues)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Flush, LeafPosition, SampleFormInput } from '@/types/sample';

// ─── Storage key ─────────────────────────────────────────────────────────────
const STORAGE_KEY = 'paatsutra:lastSamplePerClone';

// ─── Fields eligible for auto-fill ───────────────────────────────────────────
// NEVER includes: cloneNumber, treeNumber, meterReading1/2/3
// (treeNumber changes every sample; chlorophyll must always be fresh)
const AUTO_FILL_CANDIDATES: (keyof SampleFormInput)[] = [
  'leafNumber',
  'leafPosition',
  'flush',
  'gardenName',
  'sectionName',
  'healthy',
  'wilting',
  'chlorosis',
  'scorching',
  'pestDamage',
  'disease',
  'remarks',
  'wetLabCompleted',
];

// ─── Auto-fill fraction ───────────────────────────────────────────────────────
const AUTO_FILL_FRACTION = 0.7; // 70% of eligible fields

// ─── Types ────────────────────────────────────────────────────────────────────
type CloneSnapshot = Partial<SampleFormInput>;
type CloneSnapshotMap = Record<string, CloneSnapshot>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Shuffle an array in-place (Fisher-Yates) and return it.
 */
function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Load the full snapshot map from AsyncStorage.
 */
async function loadSnapshotMap(): Promise<CloneSnapshotMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CloneSnapshotMap;
  } catch {
    return {};
  }
}

/**
 * Save the updated snapshot map to AsyncStorage.
 */
async function saveSnapshotMap(map: CloneSnapshotMap): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Silently ignore storage errors — auto-fill is non-critical
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns a partial SampleFormInput with ~70% of eligible fields pre-filled
 * from the last saved sample for this clone.
 *
 * Returns `null` if no previous sample exists for this clone.
 */
export async function getAutoFillValues(
  cloneNumber: string
): Promise<Partial<SampleFormInput> | null> {
  if (!cloneNumber.trim()) return null;

  const map = await loadSnapshotMap();
  const snapshot = map[cloneNumber.trim()];
  if (!snapshot) return null;

  // Randomly select ~70% of eligible fields
  const candidates = [...AUTO_FILL_CANDIDATES];
  const shuffled = shuffleArray(candidates);
  const count = Math.round(shuffled.length * AUTO_FILL_FRACTION);
  const chosen = shuffled.slice(0, count);

  // Build the partial fill object from the snapshot
  const partial: Partial<SampleFormInput> = {};
  for (const field of chosen) {
    if (field in snapshot) {
      (partial as Record<string, unknown>)[field] = snapshot[field as keyof CloneSnapshot];
    }
  }

  return partial;
}

/**
 * Saves a snapshot of the form values for this clone number so it can be
 * used for auto-fill in the next sample of the same clone.
 *
 * Always call this AFTER a successful sample save.
 */
export async function saveCloneSnapshot(
  cloneNumber: string,
  values: SampleFormInput
): Promise<void> {
  if (!cloneNumber.trim()) return;

  const map = await loadSnapshotMap();

  // Store only the eligible-field subset (strip chlorophyll + tree number)
  const snapshot: CloneSnapshot = {};
  for (const field of AUTO_FILL_CANDIDATES) {
    if (field in values) {
      (snapshot as Record<string, unknown>)[field] = values[field as keyof SampleFormInput];
    }
  }

  map[cloneNumber.trim()] = snapshot;
  await saveSnapshotMap(map);
}

/**
 * Returns the clone number that was most recently saved to any sample.
 * Used by AddSampleScreen to decide whether the current clone == last clone.
 */
export async function getLastSavedClone(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem('paatsutra:lastSavedClone');
    return raw ?? null;
  } catch {
    return null;
  }
}

/**
 * Updates the "last saved clone" record. Call after a successful sample save.
 */
export async function setLastSavedClone(cloneNumber: string): Promise<void> {
  try {
    await AsyncStorage.setItem('paatsutra:lastSavedClone', cloneNumber.trim());
  } catch {
    // Silently ignore
  }
}

/**
 * Clears all stored clone snapshots (useful for testing / account switch).
 */
export async function clearAllCloneSnapshots(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEY, 'paatsutra:lastSavedClone']);
  } catch {
    // Silently ignore
  }
}
