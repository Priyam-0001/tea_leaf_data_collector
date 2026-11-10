import * as Network from 'expo-network';

import {
  SampleImageUploadRow,
  sampleRepository,
} from '@/database/sampleRepository';
import { supabase } from '@/database/supabase';
import {
  uploadImageToSupabase,
  deleteImageFromSupabase
} from '@/services/supabaseStorage';
import { useAlertStore } from '@/store/alertStore';
import type { Session } from '@supabase/supabase-js';
import { Sample } from '@/types/sample';

import {
  clearSyncState,
  getSyncState,
  saveSyncState,
} from '@/services/syncPersistence';

import {
  notifySyncCompleted,
  notifySyncPaused
} from '@/services/syncNotifications';

export interface UploadProgress {
  totalSamples: number;
  completedSamples: number;

  totalImages: number;
  completedImages: number;

  uploadedImages: number;
  skippedImages: number;
  failedImages: number;

  failedSamples: number;

  currentSample: string;
  currentImage: number;
}

export interface UploadResult extends UploadProgress {
  paused: boolean;
}

// ---------------------------------------------------------
// Upload state
// ---------------------------------------------------------

let pauseRequested = false;
let uploadRunning = false;

let uploadSamples: Sample[] = [];

let currentSampleIndex = 0;
let currentImageIndex = 0;

let uploadInitialized = false;

// ---------------------------------------------------------
// Session statistics
// ---------------------------------------------------------

interface UploadSessionStats {
  uploadedImages: number;
  skippedImages: number;
  failedImages: number;

  completedSamples: number;
  failedSamples: number;
}

let sessionStats: UploadSessionStats = {
  uploadedImages: 0,
  skippedImages: 0,
  failedImages: 0,

  completedSamples: 0,
  failedSamples: 0,
};

// ---------------------------------------------------------
// Pause / resume
// ---------------------------------------------------------

export function pauseUploads(): void {
  if (uploadRunning) {
    pauseRequested = true;
    console.log('Upload pause requested.');
  }
}

export function resumeUploads(): void {
  pauseRequested = false;
  console.log('Upload resume requested.');
}

export function isUploadRunning(): boolean {
  return uploadRunning;
}

export function isUploadPaused(): boolean {
  return pauseRequested && !uploadRunning;
}

// ---------------------------------------------------------
// Reset
// ---------------------------------------------------------

function resetUploadQueue(): void {
  uploadSamples = [];

  currentSampleIndex = 0;
  currentImageIndex = 0;

  uploadInitialized = false;

  sessionStats = {
    uploadedImages: 0,
    skippedImages: 0,
    failedImages: 0,

    completedSamples: 0,
    failedSamples: 0,
  };

  pauseRequested = false;
}

// ---------------------------------------------------------
// Progress helper
// ---------------------------------------------------------

function buildProgress(
  totalSamples: number,
  totalImages: number,
  currentSample: string,
  currentImage: number,
): UploadProgress {
  const completedImages =
    sessionStats.uploadedImages +
    sessionStats.skippedImages +
    sessionStats.failedImages;

  return {
    totalSamples,
    completedSamples: sessionStats.completedSamples,

    totalImages,
    completedImages,

    uploadedImages: sessionStats.uploadedImages,
    skippedImages: sessionStats.skippedImages,
    failedImages: sessionStats.failedImages,

    failedSamples: sessionStats.failedSamples,

    currentSample,
    currentImage,
  };
}

async function persistCurrentSyncState(
  totalSamples: number,
  totalImages: number,
  currentSample: string,
  currentImage: number,
  status: 'running' | 'paused',
): Promise<void> {
  await saveSyncState({
    sampleIds: uploadSamples.map(
      (sample) => sample.id,
    ),

    currentSampleIndex,
    currentImageIndex,

    totalSamples,
    totalImages,

    currentSample,
    currentImage,

    stats: {
      uploadedImages:
        sessionStats.uploadedImages,

      skippedImages:
        sessionStats.skippedImages,

      failedImages:
        sessionStats.failedImages,

      completedSamples:
        sessionStats.completedSamples,

      failedSamples:
        sessionStats.failedSamples,
    },

    status,

    updatedAt: new Date().toISOString(),
  });
}

// ---------------------------------------------------------
// Check whether image metadata already exists in Supabase
// ---------------------------------------------------------

async function imageAlreadyUploaded(
  imageId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('sample_images')
    .select('id')
    .eq('id', imageId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to check image upload status: ${error.message}`,
    );
  }

  return !!data;
}

// --------------------------------------------------------
// Helper Functions
// --------------------------------------------------------

// 1. Session Refresh Helper: Validates and refreshes the JWT if expiring within 60s
async function ensureValidSession(): Promise<Session> {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error('User is not authenticated.');
  }

  const now = Math.floor(Date.now() / 1000);
  if (session.expires_at && session.expires_at - now < 60) {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) {
      throw new Error('Session expired. Please log in again');
    }
    return data.session;
  }

  return session;
}

// 2. Timeout Helper: Rejects stalled requests on slow or dropping connections
function withTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMs: number,
  operationName = 'Operation',
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(
        new Error(
          `${operationName} time out after ${timeoutMs / 1000}s. Check your connection.`,
        ),
      );
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  })
}

// 3. Retry Helper: Retries transient failures 3 times with exponential backoff(1.5s, 3s, 6s)
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1500,
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await operation();
    }
    catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }

      // Do not retry permanent auth errors
      if (
        error instanceof Error
        && (error.message.includes('not authenticated')
          || error.message.includes('session expired'))
      ) {
        throw error;
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1);

      console.warn(
        `Attempt ${attempt} failed. Retrying in ${delay}ms...`,
        error instanceof Error ? error.message : error,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// ---------------------------------------------------------
// Upload sample metadata
// ---------------------------------------------------------

async function uploadSample(sample: Sample): Promise<void> {
  const session = await ensureValidSession();

  const { error } = await withTimeout(
    supabase
      .from('samples')
      .upsert(
        {
          id: sample.id,
          user_id: session.user.id,

          clone_number: sample.cloneNumber,
          tree_number: sample.treeNumber,
          leaf_number: sample.leafNumber,
          leaf_position: sample.leafPosition,

          meter_reading_1: sample.meterReading1,
          meter_reading_2: sample.meterReading2,
          meter_reading_3: sample.meterReading3,

          flush: sample.flush,
          flush_auto_detected: sample.flushAutoDetected,

          gps_latitude: sample.gpsLatitude,
          gps_longitude: sample.gpsLongitude,
          gps_accuracy: sample.gpsAccuracy,

          garden_name: sample.gardenName,
          section_name: sample.sectionName,

          healthy: sample.healthy,
          wilting: sample.wilting,
          chlorosis: sample.chlorosis,
          scorching: sample.scorching,
          pest_damage: sample.pestDamage,
          disease: sample.disease,

          wet_lab_completed: sample.wetLabCompleted,

          device_manufacturer: sample.deviceManufacturer,
          device_model: sample.deviceModel,
          os_name: sample.osName,
          os_version: sample.osVersion,

          installation_id: sample.installationId,
          app_version: sample.appVersion,

          remarks: sample.remarks,

          created_at: sample.createdAt,
          updated_at: sample.updatedAt,
        },
        {
          onConflict: 'id',
        },
      ),
    20000,
    `Upload sample ${sample.id}`,
  );

  if (error) {
    throw new Error(
      `Failed to upload sample ${sample.id}: ${error.message}`,
    );
  }
}

// ---------------------------------------------------------
// Upload image
// ---------------------------------------------------------

async function uploadImage(
  sample: Sample,
  image: SampleImageUploadRow,
): Promise<'uploaded' | 'skipped'> {
  // First check whether this image's metadata already exists
  // in Supabase.
  const alreadyUploaded = await imageAlreadyUploaded(image.id);

  if (alreadyUploaded) {
    return 'skipped';
  }

  // Upload actual image to Supabase Storage.
  const UploadResult = await uploadImageToSupabase(
    image.filePath,
    sample.id,
    image.id
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error('User is not authenticated.');
  }

  // Save Cloudinary URL + image metadata in Supabase.
  const { error } = await supabase
    .from('sample_images')
    .insert({
      id: image.id,
      sample_id: sample.id,
      user_id: session.user.id,

      file_path: UploadResult.publicUrl,

      sort_order: image.sortOrder,
    });

  if (error) {
    throw new Error(
      `Failed to save image metadata: ${error.message}`,
    );
  }

  return 'uploaded';
}

// ---------------------------------------------------------
// Total image count
// ---------------------------------------------------------

function getTotalImages(samples: Sample[]): number {
  return samples.reduce(
    (total, sample) => total + sample.images.length,
    0,
  );
}

// ---------------------------------------------------------
// Main upload function
// ---------------------------------------------------------

export interface UploadOptions {
  resume?: boolean;
}

export async function uploadAllSamples(
  onProgress?: (progress: UploadProgress) => void,
  options: UploadOptions = {},
): Promise<UploadResult> {
  if (uploadRunning) {
    throw new Error('Upload is already in progress.');
  }

  // -------------------------------------------------------
  // Check network
  // -------------------------------------------------------

  const networkState =
    await Network.getNetworkStateAsync();

  if (
    !networkState.isConnected ||
    networkState.isInternetReachable === false
  ) {
    useAlertStore
      .getState()
      .showAlert(
        'error',
        'No internet connection. Please connect to the internet and try again.',
      );

    throw new Error(
      'No internet connection. Please connect to the internet and try again.',
    );
  }

  // -------------------------------------------------------
  // Check authentication
  // -------------------------------------------------------

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    useAlertStore
      .getState()
      .showAlert(
        'error',
        'User is not authenticated.',
      );

    throw new Error('User is not authenticated.');
  }

  // -------------------------------------------------------
  // Initialize queue only once
  // -------------------------------------------------------

  if (!uploadInitialized) {
    const persistedState =
      options.resume
        ? await getSyncState()
        : null;

    const allSamples =
      await sampleRepository.getAll();

    const samplesWithImages = allSamples.filter(
      (sample) => sample.images.length > 0,
    );

    if (persistedState) {
      const samplesById = new Map(
        samplesWithImages.map((sample) => [
          sample.id,
          sample,
        ]),
      );

      const restoredSamples =
        persistedState.sampleIds.map((id) =>
          samplesById.get(id),
        );

      const missingSamples =
        restoredSamples.filter(
          (sample): sample is undefined =>
            sample === undefined,
        );

      if (missingSamples.length > 0) {
        throw new Error(
          'Some samples from the previous sync are no longer available locally.',
        );
      }

      uploadSamples =
        restoredSamples as Sample[];

      currentSampleIndex =
        persistedState.currentSampleIndex;

      currentImageIndex =
        persistedState.currentImageIndex;

      sessionStats = {
        uploadedImages:
          persistedState.stats.uploadedImages,

        skippedImages:
          persistedState.stats.skippedImages,

        failedImages:
          persistedState.stats.failedImages,

        completedSamples:
          persistedState.stats.completedSamples,

        failedSamples:
          persistedState.stats.failedSamples,
      };
    } else {
      // Start a completely new sync with only samples that contain images.
      uploadSamples = samplesWithImages;

      currentSampleIndex = 0;
      currentImageIndex = 0;

      sessionStats = {
        uploadedImages: 0,
        skippedImages: 0,
        failedImages: 0,

        completedSamples: 0,
        failedSamples: 0,
      };
    }

    uploadInitialized = true;
  }

  const totalSamples = uploadSamples.length;
  const totalImages = getTotalImages(uploadSamples);

  if (totalSamples === 0) {
    await clearSyncState();
    resetUploadQueue();
    return {
      ...buildProgress(0, 0, '', 0),
      paused: false,
    };
  }

  await persistCurrentSyncState(
    totalSamples,
    totalImages,
    uploadSamples[currentSampleIndex]?.id ?? '',
    currentImageIndex,
    'running',
  );

  uploadRunning = true;
  pauseRequested = false;

  try {
    // =====================================================
    // SAMPLE LOOP
    // =====================================================

    while (
      currentSampleIndex < uploadSamples.length
    ) {
      const sample =
        uploadSamples[currentSampleIndex];

      // Get all local images for this sample.
      const images =
        await sampleRepository.getImageRowsBySampleId(
          sample.id,
        );

      // Do not sync sample if it has no images.
      if (images.length === 0) {
        currentSampleIndex++;
        currentImageIndex = 0;
        continue;
      }

      // ---------------------------------------------------
      // Upload sample metadata
      // ---------------------------------------------------

      if (currentImageIndex === 0) {
        try {
          await retryWithBackoff(() => uploadSample(sample), 3, 1500);
        } catch (error) {
          sessionStats.failedSamples++;

          console.error(
            `Failed to upload sample ${sample.id}:`,
            error,
          );

          // Since the sample itself failed, its images
          // cannot be associated with the cloud sample.
          sessionStats.failedImages += images.length;

          currentSampleIndex++;
          currentImageIndex = 0;

          onProgress?.(
            buildProgress(
              totalSamples,
              totalImages,
              sample.id,
              0,
            ),
          );

          continue;
        }
      }

      // ===================================================
      // IMAGE LOOP
      // ===================================================

      while (
        currentImageIndex < images.length
      ) {
        // -------------------------------------------------
        // Check pause before starting next image
        // -------------------------------------------------

        if (pauseRequested) {
          const progress = buildProgress(
            totalSamples,
            totalImages,
            sample.id,
            currentImageIndex + 1,
          );

          await persistCurrentSyncState(
            totalSamples,
            totalImages,
            sample.id,
            currentImageIndex,
            'paused',
          );

          await notifySyncPaused(
            progress.completedImages,
            progress.totalImages,
          );

          return {
            ...progress,
            paused: true,
          };
        }

        const image =
          images[currentImageIndex];

        // -------------------------------------------------
        // Tell UI which image is being processed
        // -------------------------------------------------

        onProgress?.(
          buildProgress(
            totalSamples,
            totalImages,
            sample.id,
            currentImageIndex + 1,
          ),
        );

        // -------------------------------------------------
        // Upload image
        // -------------------------------------------------

        try {
          const result = await retryWithBackoff(
            () => uploadImage(sample, image),
            3,
            1500,
          );

          if (result === 'uploaded') {
            sessionStats.uploadedImages++;
          } else {
            sessionStats.skippedImages++;
          }
        } catch (error) {
          console.error(
            `Failed to upload image ${image.id} for sample ${sample.id}:`,
            error,
          );

          sessionStats.failedImages++;
        }

        // -------------------------------------------------
        // Move to next image
        //
        // IMPORTANT:
        // This happens ONLY ONCE.
        // -------------------------------------------------

        currentImageIndex++;

        await persistCurrentSyncState(
          totalSamples,
          totalImages,
          sample.id,
          currentImageIndex,
          'running',
        );

        onProgress?.(
          buildProgress(
            totalSamples,
            totalImages,
            sample.id,
            currentImageIndex,
          ),
        );
      }

      // ===================================================
      // SAMPLE COMPLETED
      // ===================================================

      sessionStats.completedSamples++;

      currentSampleIndex++;
      currentImageIndex = 0;

      await persistCurrentSyncState(
        totalSamples,
        totalImages,
        uploadSamples[currentSampleIndex]?.id ?? '',
        0,
        'running',
      );

      onProgress?.(
        buildProgress(
          totalSamples,
          totalImages,
          sample.id,
          0,
        ),
      );
    }

    // =====================================================
    // EVERYTHING FINISHED
    // =====================================================

    const result: UploadResult = {
      ...buildProgress(
        totalSamples,
        totalImages,
        '',
        0,
      ),
      paused: false,
    };

    await clearSyncState();

    await notifySyncCompleted(
      sessionStats.uploadedImages,
      sessionStats.skippedImages,
      sessionStats.failedImages,
    );

    // Only reset after the entire queue has finished.
    resetUploadQueue();

    return result;
  } finally {
    uploadRunning = false;
  }
}