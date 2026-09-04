import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { sampleRepository } from '@/database/sampleRepository';
import type { Sample } from '@/types/sample';
import { deleteSampleImages } from '@/services/imageService';
import { getCsvExportFilename, samplesToCsv } from '@/utils/csv';

export interface ExportResult {
  filePath: string;
  recordCount: number;
}

export interface ExportSelectionData {
  samplesWithImages: Sample[];
  samplesWithoutImages: Sample[];
}

async function getAllSamplesForExport() {
  return sampleRepository.getAll();
}

function splitSamplesByImageAvailability(samples: Sample[]): ExportSelectionData {
  return {
    samplesWithImages: samples.filter((sample) => sample.images.length > 0),
    samplesWithoutImages: samples.filter((sample) => sample.images.length === 0),
  };
}

async function getExportData() {
  const samples = await getAllSamplesForExport();
  const { samplesWithImages, samplesWithoutImages } = splitSamplesByImageAvailability(samples);

  return {
    totalCount: samples.length,
    exportableSamples: samplesWithImages,
    exportableCount: samplesWithImages.length,
    skippedCount: samplesWithoutImages.length,
  };
}

export async function getExportSelectionData(): Promise<ExportSelectionData> {
  const samples = await getAllSamplesForExport();
  return splitSamplesByImageAvailability(samples);
}

export async function getExportCounts(): Promise<{
  totalCount: number;
  exportableCount: number;
  skippedCount: number;
}> {
  const { totalCount, exportableCount, skippedCount } = await getExportData();

  return {
    totalCount,
    exportableCount,
    skippedCount,
  };
}

/** Generate CSV content from stored samples that have images. */
export async function buildExportCsv(
  samples: Sample[],
): Promise<{ csv: string; count: number }> {
  const exportableSamples = samples.filter((sample) => sample.images.length > 0);

  return {
    csv: samplesToCsv(exportableSamples),
    count: exportableSamples.length,
  };
}

export async function exportImages(directory: Directory, samples: Sample[]) {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const stamp = `${date.getFullYear()}_${pad(date.getMonth() + 1)}_${pad(date.getDate())}`;
  const imageDirectory = directory.createDirectory(`sample_images_${stamp}`);

  for (const sample of samples) {
    for (const imageUri of sample.images) {
      try {
        const sourceFile = new File(imageUri);
        const bytes = await sourceFile.bytes();
        const fileName = imageUri.split('/').pop() || 'none.png';

        const destinationFile = imageDirectory.createFile(fileName, 'image/png');
        destinationFile.write(bytes);
      } catch (error) {
        console.warn(
          `Failed to export image ${imageUri}`,
          error
        );
      }
    }
  }
}

/**
 * Export CSV to user-selected directory (Android SAF) or share sheet fallback.
 */
export async function exportRecordsToFile(selectedSamples?: Sample[]): Promise<ExportResult> {
  const samples = selectedSamples ?? (await getExportData()).exportableSamples;
  const exportableSamples = samples.filter((sample) => sample.images.length > 0);

  if (exportableSamples.length === 0) {
    throw new Error('Select at least one sample with images to export.');
  }

  const { csv, count } = await buildExportCsv(exportableSamples);
  const filename = getCsvExportFilename();

  if (Platform.OS === 'android') {
    const directory = await Directory.pickDirectoryAsync();
    const file = directory.createFile(filename, 'text/csv');
    file.write(csv);

    await exportImages(directory, exportableSamples);
    return { filePath: file.uri, recordCount: count };
  }

  const cacheFile = new File(Paths.cache, filename);
  cacheFile.write(csv);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(cacheFile.uri, {
      mimeType: 'text/csv',
      dialogTitle: 'Save tea dataset export',
    });
  }

  return { filePath: cacheFile.uri, recordCount: count };
}

export async function clearRecords() {
  const samples = await getAllSamplesForExport();
  samples.forEach((sample) => deleteSampleImages(sample.images));
  await sampleRepository.clear();

  const imageDirectory = new Directory(
    Paths.document,
    'sample_images'
  );

  if (imageDirectory.exists) {
    imageDirectory.delete();
  }
}

export async function clearSelectedRecords(selectedSamples: Sample[]) {
  if (selectedSamples.length === 0) {
    throw new Error('Select at least one sample to clear.');
  }

  selectedSamples.forEach((sample) => deleteSampleImages(sample.images));
  await sampleRepository.deleteByIds(selectedSamples.map((sample) => sample.id));

  return {
    clearedCount: selectedSamples.length,
  };
}
