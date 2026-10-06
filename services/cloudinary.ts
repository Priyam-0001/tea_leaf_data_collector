import { supabase } from '@/database/supabase';
import { fetch } from 'expo/fetch';
import { File } from 'expo-file-system';

interface CloudinarySignature {
    cloudName: string;
    apiKey: string;
    timestamp: number;
    signature: string;
    folder: string;
}

export interface CloudinaryUploadResult {
    asset_id: string;
    asset_folder: string;
    bytes: number;
    created_at: string;
    display_name: string;
    etag: string;
    format: string;
    height: number;
    original_filename: string;
    placeholder: boolean;
    public_id: string;
    resource_type: string;
    secure_url: string;
    signature: string;
    type: string;
    url: string;
    version: number;
    version_id: string;
    width: number;
}

async function getCloudinarySignature(): Promise<CloudinarySignature> {
    const { data, error } = await supabase.functions.invoke(
        'cloudinary-signin',
        {
            body: {},
        }
    );

    if (error) {
        let message = 'Failed to get Cloudinary upload signature.';

        try {
            const errorBody = await error.context?.json();

            if (errorBody?.error) {
                message = errorBody.error;
            }
        } catch {
            // Keep the default error message.
        }

        throw new Error(message);
    }

    if (!data) {
        throw new Error('Cloudinary signing function returned no data.');
    }

    return data as CloudinarySignature;
}

function getFileName(uri: string): string {
    const filename = uri.split('/').pop();

    return filename || `tea_sample_${Date.now()}.jpg`;
}

function getMimeType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'png':
            return 'image/png';

        case 'webp':
            return 'image/webp';

        case 'heic':
            return 'image/heic';

        case 'heif':
            return 'image/heif';

        case 'jpg':
        case 'jpeg':
        default:
            return 'image/jpeg';
    }
}

export async function uploadImageToCloudinary(
    imageUri: string
): Promise<CloudinaryUploadResult> {
    if (!imageUri) {
        throw new Error('Image URI is required.');
    }

    // 1. Get a signed upload request from our Edge Function
    const {
        cloudName,
        apiKey,
        timestamp,
        signature,
        folder,
    } = await getCloudinarySignature();

    // 2. Prepare the local image
    const fileName = getFileName(imageUri);
    const mimeType = getMimeType(fileName);

    const file = new File(imageUri);

    const formData = new FormData();

    formData.append('file', file);

    // These values must match the values used when
    // the Edge Function generated the signature.
    formData.append('api_key', apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
    formData.append('folder', folder);

    // 3. Upload directly to Cloudinary
    const uploadUrl =
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        console.error('Cloudinary upload failed:', result);

        throw new Error(
            result?.error?.message ||
            'Failed to upload image to Cloudinary.'
        );
    }

    return result as CloudinaryUploadResult;
}