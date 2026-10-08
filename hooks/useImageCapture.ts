import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useCameraPermission } from 'react-native-vision-camera';

import { deleteSampleImage, saveSampleImage } from '@/services/imageService';

export interface CapturedImage {
  uri: string;
  filePath?: string;
  isNew: boolean;
}

interface UseImageCaptureOptions {
  cloneNumber: string;
  treeNumber: string;
  leafNumber: string;
  installationId?: string;
}

export function useImageCapture(options: UseImageCaptureOptions) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const openCamera = useCallback(async () => {
    if (!hasPermission) {
      await requestPermission();
      if (!hasPermission) {
        Alert.alert('Camera permission', 'Camera access is required to capture leaf images.');
        return;
      }
    }

    setShowCamera(true);
  }, [hasPermission, requestPermission]);

  const handleCapture = useCallback(
    (tempUri: string) => {
      const nextIndex = images.length + 1;

      const filePath = saveSampleImage({
        tempUri,
        imageIndex: nextIndex,
      });

      setImages((current) => [...current, { uri: filePath, filePath, isNew: true }]);
      setShowCamera(false);
    },
    [images.length, options.installationId],
  );

  const removeImage = useCallback((index: number) => {
    setImages((current) => current.filter((_, i) => i !== index));
  }, []);

  const removeAndDeleteImage = useCallback((index: number) => {
    setImages((current) => {
      const target = current[index];
      const path = target?.filePath ?? target?.uri;
      if (path) {
        deleteSampleImage(path);
      }
      return current.filter((_, i) => i !== index);
    });
  }, []);

  const setExistingImages = useCallback((paths: string[]) => {
    setImages(paths.map((path) => ({ uri: path, filePath: path, isNew: false })));
  }, []);

  const resetImages = useCallback(() => {
    setImages([]);
  }, []);

  const cleanupNewImages = useCallback(() => {
    setImages((current) => {
      current.forEach((image) => {
        if (image.isNew) {
          const path = image.filePath ?? image.uri;
          if (path) {
            deleteSampleImage(path);
          }
        }
      });
      return current.filter((image) => !image.isNew);
    });
  }, []);

  return {
    images,
    showCamera,
    setShowCamera,
    openCamera,
    handleCapture,
    removeImage,
    removeAndDeleteImage,
    setExistingImages,
    resetImages,
    cleanupNewImages,
  };
}
