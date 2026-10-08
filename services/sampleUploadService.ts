import * as Network from 'expo-network';

import { SampleImageUploadRow, sampleRepository } from '@/database/sampleRepository';
import { supabase } from '@/database/supabase';
import { uploadImageToCloudinary } from '@/services/cloudinary';
import { Sample } from '@/types/sample';

export interface UploadProgress {
  totalSamples: number;
  completedSamples: number;
  currentSample: string;
  uploadedImages: number;
  skippedImages: number;
  failedSamples: number;
}

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

async function uploadImage(
  sample: Sample,
  image: SampleImageUploadRow,
): Promise<'uploaded' | 'skipped'> {
  // Check cloud database first.
  const alreadyUploaded = await imageAlreadyUploaded(image.id);

  if (alreadyUploaded) {
    return 'skipped';
  }

  // Upload local file directly to Cloudinary.
  const cloudinaryResult = await uploadImageToCloudinary(
    image.filePath
  );

  if (!cloudinaryResult.secure_url) {
    throw new Error(
      'Cloudinary upload succeeded but no secure URL was returned.',
    );
  }

  // Save the returned Cloudinary URL in Supabase.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error('User is not authenticated.');
  }

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

export async function uploadAllSamples(
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadProgress> {
  const networkState = await Network.getNetworkStateAsync();

  if (
    !networkState.isConnected ||
    networkState.isInternetReachable === false
  ) {
    throw new Error(
      'No internet connection. Please connect to the internet and try again.',
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error('User is not authenticated.');
  }

  const samples = await sampleRepository.getAll();

  const progress: UploadProgress = {
    totalSamples: samples.length,
    completedSamples: 0,
    currentSample: '',
    uploadedImages: 0,
    skippedImages: 0,
    failedSamples: 0,
  };

  for (const sample of samples) {
    progress.currentSample = sample.id;
    onProgress?.({ ...progress });

    try {
      // --------------------------------
      // 1. SAMPLE FIRST
      // --------------------------------
      await uploadSample(sample);

      // --------------------------------
      // 2. IMAGES AFTER SAMPLE
      // --------------------------------
      const images =
        await sampleRepository.getImageRowsBySampleId(sample.id);

      for (const image of images) {
        const result = await uploadImage(sample, image);

        if (result === 'uploaded') {
          progress.uploadedImages++;
        } else {
          progress.skippedImages++;
        }

        onProgress?.({ ...progress });
      }

      progress.completedSamples++;
    } catch (error) {
      progress.failedSamples++;

      console.error(
        `Failed to upload sample ${sample.id}:`,
        error,
      );
    }

    onProgress?.({ ...progress });
  }

  return progress;
}