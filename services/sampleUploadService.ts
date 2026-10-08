import * as Network from 'expo-network';

import {
  SampleImageUploadRow,
  sampleRepository,
} from '@/database/sampleRepository';
import { supabase } from '@/database/supabase';
import { uploadImageToCloudinary } from '@/services/cloudinary';
import { useAlertStore } from '@/store/alertStore';
import { Sample } from '@/types/sample';

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

// ---------------------------------------------------------
// Upload sample metadata
// ---------------------------------------------------------

async function uploadSample(sample: Sample): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error('User is not authenticated.');
  }

  const { error } = await supabase
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

  // Upload actual image to Cloudinary.
  const cloudinaryResult = await uploadImageToCloudinary(
    image.filePath,
  );

  if (!cloudinaryResult.secure_url) {
    throw new Error(
      'Cloudinary upload succeeded but no secure URL was returned.',
    );
  }

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

      file_path: cloudinaryResult.secure_url,

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

export async function uploadAllSamples(
  onProgress?: (progress: UploadProgress) => void,
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
    uploadSamples =
      await sampleRepository.getAll();

    currentSampleIndex = 0;
    currentImageIndex = 0;

    sessionStats = {
      uploadedImages: 0,
      skippedImages: 0,
      failedImages: 0,

      completedSamples: 0,
      failedSamples: 0,
    };

    uploadInitialized = true;
  }

  const totalSamples = uploadSamples.length;
  const totalImages = getTotalImages(uploadSamples);

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

      // ---------------------------------------------------
      // Upload sample metadata
      // ---------------------------------------------------

      if (currentImageIndex === 0) {
        try {
          await uploadSample(sample);
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
          return {
            ...buildProgress(
              totalSamples,
              totalImages,
              sample.id,
              currentImageIndex + 1,
            ),
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
          const result = await uploadImage(
            sample,
            image,
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

    // Only reset after the entire queue has finished.
    resetUploadQueue();

    return result;
  } finally {
    uploadRunning = false;
  }
}