import { File } from 'expo-file-system';
import { supabase } from '@/database/supabase';

const BUCKET_NAME = 'sample-images';

function getMimeType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}

export interface SupabaseUploadResult {
  publicUrl: string;
  storagePath: string;
}

export async function uploadImageToSupabase(
  imageUri: string,
  sampleId: string,
  imageId: string,
): Promise<SupabaseUploadResult> {
  if (!imageUri) {
    throw new Error('Image URI is required.');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('User is not authenticated.');
  }

  // 1. Read binary bytes using expo-file-system
  const localFile = new File(imageUri);
  if (!localFile.exists) {
    throw new Error(`Local image file not found: ${imageUri}`);
  }
  const bytes = await localFile.bytes();

  // 2. Structured path in bucket: <userId>/<sampleId>/<imageId>.jpg
  const fileName = imageUri.split('/').pop() || `${imageId}.jpg`;
  const mimeType = getMimeType(fileName);
  const extension = mimeType === 'image/png' ? 'png' : 'jpg';
  const storagePath = `${session.user.id}/${sampleId}/${imageId}.${extension}`;

  // 3. Upload binary bytes to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, bytes, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    console.error('Supabase storage upload failed:', uploadError);
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  // 4. Retrieve the public URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  return {
    publicUrl: publicUrlData.publicUrl,
    storagePath,
  };
}