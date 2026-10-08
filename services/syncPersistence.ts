import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_STATE_KEY = '@tea_leaf_data_collector/sync_state';

export interface PersistedSyncStats {
  uploadedImages: number;
  skippedImages: number;
  failedImages: number;
  completedSamples: number;
  failedSamples: number;
}

export interface PersistedSyncState {
  sampleIds: string[];

  currentSampleIndex: number;
  currentImageIndex: number;

  totalSamples: number;
  totalImages: number;

  currentSample: string;
  currentImage: number;

  stats: PersistedSyncStats;

  /**
   * A sync that exists in storage is considered resumable.
   *
   * "running" means the app was syncing when the checkpoint
   * was last written.
   *
   * "paused" means the user explicitly paused it.
   */
  status: 'running' | 'paused';

  updatedAt: string;
}

export async function saveSyncState(
  state: PersistedSyncState,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      SYNC_STATE_KEY,
      JSON.stringify(state),
    );
  } catch (error) {
    console.error(
      'Failed to persist sync state:',
      error,
    );
  }
}

export async function getSyncState(): Promise<PersistedSyncState | null> {
  try {
    const value =
      await AsyncStorage.getItem(SYNC_STATE_KEY);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as PersistedSyncState;
  } catch (error) {
    console.error(
      'Failed to read persisted sync state:',
      error,
    );

    return null;
  }
}

export async function clearSyncState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SYNC_STATE_KEY);
  } catch (error) {
    console.error(
      'Failed to clear sync state:',
      error,
    );
  }
}