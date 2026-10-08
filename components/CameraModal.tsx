import { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, usePhotoOutput } from 'react-native-vision-camera';

import { ActionButton } from '@/components/ActionButton';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

type CaptureState = 'idle' | 'capturing' | 'processing';


export function CameraModal({ visible, onClose, onCapture }: CameraModalProps) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [captureState, setCaptureState] = useState<CaptureState>('idle');
  const device = useCameraDevice('back');
  const photoOutput = usePhotoOutput({
    qualityPrioritization: 'speed',
  });

  const handleCapture = async () => {
    if (!device || captureState !== 'idle') return;

    let photo;
    let image;

    try {
      setCaptureState('capturing')
      photo = await photoOutput.capturePhoto(
        {
          flashMode: 'off',
          enableShutterSound: false
        },
        {}
      );
      setCaptureState('processing');

      image = await photo.toImageAsync();

      // const targetHeight = 3072;
      // const targetWidth = Math.round(
      //   image.width * (targetHeight / image.height)
      // );

      // const resizedImage = await image.resizeAsync(
      //   targetWidth,
      //   targetHeight
      // );
      // console.log(
      //   'Resized:',
      //   resizedImage.width,
      //   'x',
      //   resizedImage.height
      // );
      
      const tempPngPath = await image.saveToTemporaryFileAsync('jpg');
      onCapture(tempPngPath);
    } catch (error) {
      console.error('Camera capture failed:', error);
    } finally {
      // Dispose native objects to avoid memory leaks and JPromise issues
      // Keep variables in scope to prevent GC during dispose
      if (photo) {
        try {
          // Keep reference during dispose
          const p = photo;
          p.dispose();
        } catch (e) {
          console.warn('Failed to dispose photo:', e);
        }
      }
      if (image) {
        try {
          // Keep reference during dispose
          const i = image;
          i.dispose();
        } catch (e) {
          console.warn('Failed to dispose image:', e);
        }
      }
      // Null out references only after dispose completes
      photo = null;
      image = null;
      setCaptureState('idle');
    }
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {hasPermission && device ? (
          <>
            <Camera
              style={styles.camera}
              device={device}
              isActive={visible && captureState !== 'processing'}
              outputs={[photoOutput]}
            />

            {captureState === 'processing' && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator
                  size="large"
                  color="#FFFFFF"
                />

                <Text style={styles.processingTitle}>
                  Processing image...
                </Text>

                <Text style={styles.processingSubtitle}>
                  Photo captured successfully.
                  {'\n'}
                  You can move the camera now.
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionText}>Camera permission is required.</Text>
          </View>
        )}

        <View style={styles.controls}>
          <ActionButton
            label={
              captureState === 'capturing'
                ? 'Capturing...'
                : captureState === 'processing'
                  ? "Processing Image..."
                  : 'Capture Photo'
            }
            onPress={handleCapture}
            disabled={captureState !== 'idle'}
          />
          <ActionButton
            label="Close Camera"
            onPress={onClose}
            variant="secondary"
            disabled={captureState !== 'idle'}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  permissionText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    textAlign: 'center',
  },
  controls: {
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  processingTitle: {
    marginTop: SPACING.md,
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sectionTitle,
    fontWeight: '700',
  },

  processingSubtitle: {
    marginTop: SPACING.sm,
    color: '#FFFFFF',
    fontSize: FONT_SIZES.body,
    textAlign: 'center',
    lineHeight: 22,
  },
});