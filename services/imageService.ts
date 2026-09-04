import { Directory, File, Paths } from 'expo-file-system';

import { IMAGES_DIR_NAME } from '@/constants/theme';
import { generateImageFileName } from '@/utils/sampleId';

function getImagesRootDirectory(): Directory {
  return new Directory(Paths.document, IMAGES_DIR_NAME);
}

function ensureImagesRoot(): Directory {
  const root = getImagesRootDirectory();
  if (!root.exists) {
    root.create();
  }
  return root;
}

export interface SaveImageParams {
  tempUri: string;
  installationId: string;
  imageIndex: number;
}

/** Copy a captured image into persistent app storage with standardized naming. */
export function saveSampleImage(params: SaveImageParams): string {
  const root = ensureImagesRoot();
  const fileName = generateImageFileName(
    {
      installationId: params.installationId,
    },
    params.imageIndex,
  );

  const destination = new File(root, fileName);
  // Ensure we have a proper file URI (add file:// if missing)
  const sourceUri = params.tempUri.startsWith('file://') 
    ? params.tempUri 
    : `file://${params.tempUri}`;
  const source = new File(sourceUri);

  if (!source.exists) {
    throw new Error('Captured image file not found.');
  }

  if (destination.exists) {
    destination.delete();
  }

  source.move(destination);
  // console.log('Image saved:', destination.uri);
  return destination.uri;
}

/** Delete image file from disk if it exists. */
export function deleteSampleImage(filePath: string): void {
  try {
    // Ensure we have a proper file URI (add file:// if missing)
    const fileUri = filePath.startsWith('file://') 
      ? filePath 
      : `file://${filePath}`;
    const file = new File(fileUri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn('Failed to delete image:', filePath, error);
  }
}

/** Delete all image files associated with a sample. */
export function deleteSampleImages(imagePaths: string[]): void {
  imagePaths.forEach(deleteSampleImage);
}
