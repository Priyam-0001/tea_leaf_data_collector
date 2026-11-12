import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from 'react-native-vision-camera';

import { Camera as CameraIcon, X } from 'lucide-react-native';

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
      setCaptureState('capturing');
      photo = await photoOutput.capturePhoto(
        {
          flashMode: 'off',
          enableShutterSound: false,
        },
        {}
      );
      setCaptureState('processing');

      image = await photo.toImageAsync();
      const tempPngPath = await image.saveToTemporaryFileAsync('jpg');
      onCapture(tempPngPath);
    } catch (error) {
      console.error('Camera capture failed:', error);
    } finally {
      if (photo) {
        try {
          const p = photo;
          p.dispose();
        } catch (e) {
          console.warn('Failed to dispose photo:', e);
        }
      }
      if (image) {
        try {
          const i = image;
          i.dispose();
        } catch (e) {
          console.warn('Failed to dispose image:', e);
        }
      }
      photo = null;
      image = null;
      setCaptureState('idle');
    }
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Header Bar inside Camera */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeRoundBtn}
            onPress={onClose}
            disabled={captureState !== 'idle'}
            activeOpacity={0.7}
          >
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.modeBadge}>
            <Text style={styles.modeText}>Leaf Capture Mode</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {hasPermission && device ? (
          <View style={styles.cameraWrap}>
            <Camera
              style={styles.camera}
              device={device}
              isActive={visible && captureState !== 'processing'}
              outputs={[photoOutput]}
            />

            {/* Target reticle / viewfinder guide */}
            <View style={styles.viewfinderGuide}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>

            {captureState === 'processing' && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#E5A820" />
                <Text style={styles.processingTitle}>Saving Photo…</Text>
                <Text style={styles.processingSubtitle}>
                  Hold steady while photo is processed
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionText}>Camera permission is required.</Text>
            <TouchableOpacity
              style={styles.permissionBtn}
              onPress={requestPermission}
              activeOpacity={0.8}
            >
              <Text style={styles.permissionBtnText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Control Bar */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.shutterBtn,
              captureState !== 'idle' && styles.shutterDisabled,
            ]}
            onPress={handleCapture}
            disabled={captureState !== 'idle'}
            activeOpacity={0.8}
          >
            <View style={styles.shutterInner}>
              <CameraIcon size={26} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeTextBtn}
            onPress={onClose}
            disabled={captureState !== 'idle'}
            activeOpacity={0.7}
          >
            <Text style={styles.closeText}>Close Camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1424',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(10, 20, 36, 0.9)',
  },
  closeRoundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBadge: {
    backgroundColor: 'rgba(229, 168, 32, 0.2)',
    borderWidth: 1,
    borderColor: '#E5A820',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  modeText: {
    color: '#E5A820',
    fontSize: 12,
    fontWeight: '700',
  },

  cameraWrap: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },

  viewfinderGuide: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    right: '10%',
    bottom: '20%',
    pointerEvents: 'none',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#FFFFFF',
    opacity: 0.85,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 },

  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  permissionText: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  permissionBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  controls: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#0A1424',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  shutterBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#E5A820',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E5A820',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#1D3557',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  closeTextBtn: {
    paddingVertical: 4,
  },
  closeText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },

  processingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 20, 36, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  processingTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  processingSubtitle: {
    color: '#CBD5E1',
    fontSize: 13,
    textAlign: 'center',
  },
});
