import * as Network from 'expo-network';
import { router, useFocusEffect } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  Cloud,
  FileCheck2,
  Pause,
  Play,
  RefreshCw,
  UploadCloud,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import {
  pauseUploads,
  uploadAllSamples,
} from '@/services/sampleUploadService';
import { notifySyncStarted } from '@/services/syncNotifications';
import { getSyncState } from '@/services/syncPersistence';
import { useAlertStore } from '@/store/alertStore';
import { useSampleStore } from '@/store/sampleStore';

const C = {
  navy: '#0D1F3C',
  navyMid: '#1E3A5F',
  page: '#F0F5FF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  blue: '#2563EB',
  blueLight: '#EFF6FF',
  blueBorder: '#BFDBFE',
  green: '#16A34A',
  greenLight: '#F0FDF4',
  greenBorder: '#BBF7D0',
  gold: '#E5A820',
  btnPrimary: '#1D3557',
  btnShadow: '#0A1A30',
  textMuted: '#64748B',
  danger: '#DC2626',
};

interface UploadProgress {
  totalSamples: number;
  completedSamples: number;
  currentSample: string;
  uploadedImages: number;
  skippedImages: number;
  failedImages: number;
  failedSamples: number;
  totalImages: number;
  completedImages: number;
  currentImage: number;
}

const initialProgress: UploadProgress = {
  totalSamples: 0,
  completedSamples: 0,
  currentSample: '',
  uploadedImages: 0,
  skippedImages: 0,
  failedImages: 0,
  failedSamples: 0,
  totalImages: 0,
  completedImages: 0,
  currentImage: 0,
};

export default function SyncScreen() {
  const samples = useSampleStore((state) => state.samples);
  const showAlert = useAlertStore.getState().showAlert;

  const [uploading, setUploading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isPausing, setIsPausing] = useState(false);

  const [uploadProgress, setUploadProgress] = useState<UploadProgress>(initialProgress);

  const samplesWithImages = samples.filter((sample) => sample.images.length > 0).length;
  const totalLocalImages = samples.reduce((total, sample) => total + sample.images.length, 0);

  useEffect(() => {
    let mounted = true;

    async function restoreSyncState() {
      const state = await getSyncState();
      if (!state || !mounted) return;

      setHasStarted(true);
      setCompleted(false);
      setPaused(true);
      setUploadProgress({
        totalSamples: state.totalSamples,
        completedSamples: state.stats.completedSamples,
        currentSample: state.currentSample,
        uploadedImages: state.stats.uploadedImages,
        skippedImages: state.stats.skippedImages,
        failedImages: state.stats.failedImages,
        failedSamples: state.stats.failedSamples,
        totalImages: state.totalImages,
        completedImages:
          state.stats.uploadedImages +
          state.stats.skippedImages +
          state.stats.failedImages,
        currentImage: state.currentImage,
      });
    }

    restoreSyncState();
    return () => {
      mounted = false;
    };
  }, []);

  const handleBack = () => {
    if (uploading) {
      Alert.alert(
        'Sync in progress',
        'Upload is currently running. Pausing upload before navigating away.',
        [
          { text: 'Wait', style: 'cancel' },
          {
            text: 'Pause & Leave',
            style: 'destructive',
            onPress: async () => {
              await handlePause();
              router.back();
            },
          },
        ]
      );
      return;
    }
    router.back();
  };

  useFocusEffect(
    useCallback(() => {
      const handleHardwareBack = () => {
        handleBack();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleHardwareBack
      );
      return () => backHandler.remove();
    }, [uploading])
  );

  const handleStartSync = async () => {
    const network = await Network.getNetworkStateAsync();
    if (!network.isConnected || !network.isInternetReachable) {
      showAlert('error', 'No internet connection. Please connect to Wi-Fi or mobile data.');
      return;
    }

    await notifySyncStarted(totalLocalImages);
    setHasStarted(true);
    setUploading(true);
    setPaused(false);
    setCompleted(false);

    try {
      const result = await uploadAllSamples((progress) => {
        setUploadProgress(progress);
      });

      setUploading(false);
      setCompleted(!result.paused);
      showAlert(
        result.failedSamples > 0 ? 'warning' : 'success',
        result.paused
          ? 'Sync paused.'
          : `Sync finished: ${result.uploadedImages} uploaded, ${result.failedImages} failed.`
      );
    } catch {
      showAlert('error', 'An error occurred during synchronization.');
      setUploading(false);
    }
  };

  const handlePause = async () => {
    setIsPausing(true);
    try {
      await pauseUploads();
      setPaused(true);
      setUploading(false);
    } finally {
      setIsPausing(false);
    }
  };

  const handleResumeSync = async () => {
    const network = await Network.getNetworkStateAsync();
    if (!network.isConnected) {
      showAlert('error', 'No internet connection to resume sync.');
      return;
    }

    setPaused(false);
    setUploading(true);

    try {
      const result = await uploadAllSamples((progress) => {
        setUploadProgress(progress);
      });

      setUploading(false);
      setCompleted(!result.paused);
      showAlert(
        result.failedSamples > 0 ? 'warning' : 'success',
        result.paused
          ? 'Sync paused.'
          : `Sync finished: ${result.uploadedImages} uploaded, ${result.failedImages} failed.`
      );
    } catch {
      showAlert('error', 'Sync encountered an error.');
      setUploading(false);
    }
  };

  const handleDone = () => {
    router.back();
  };

  const handleStartAgain = () => {
    setUploadProgress(initialProgress);
    setCompleted(false);
    setHasStarted(false);
    setPaused(false);
    setIsPausing(false);
  };

  const progressPercentage =
    uploadProgress.totalImages > 0
      ? Math.round((uploadProgress.completedImages / uploadProgress.totalImages) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Cloud Sync"
          subtitle="Synchronize local research records with Supabase"
          onBack={handleBack}
        />

        {!hasStarted ? (
          /* ── READY STATE ── */
          <View style={styles.readyCard}>
            <View style={styles.cloudIconBadge}>
              <UploadCloud size={44} color={C.blue} strokeWidth={1.8} />
            </View>

            <Text style={styles.readyTitle}>Ready to Synchronize</Text>
            <Text style={styles.readySub}>
              Upload your locally collected tea leaf samples and attached photos safely to the cloud.
            </Text>

            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricValue}>{samplesWithImages}</Text>
                <Text style={styles.metricLabel}>Samples to Sync</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricBox}>
                <Text style={[styles.metricValue, { color: C.green }]}>{totalLocalImages}</Text>
                <Text style={styles.metricLabel}>Total Photos</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, samplesWithImages === 0 && styles.btnDisabled]}
              onPress={handleStartSync}
              disabled={samplesWithImages === 0}
              activeOpacity={0.85}
            >
              <RefreshCw size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>
                {samplesWithImages > 0 ? 'Start Sync to Cloud' : 'No Samples Ready'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── ACTIVE / PAUSED / COMPLETED SYNC STATE ── */
          <View style={styles.syncStateCard}>
            <View
              style={[
                styles.statusIconWrap,
                completed
                  ? styles.statusCompleted
                  : paused
                  ? styles.statusPaused
                  : styles.statusSyncing,
              ]}
            >
              {completed ? (
                <CheckCircle2 size={40} color={C.green} />
              ) : paused ? (
                <Pause size={36} color={C.gold} />
              ) : (
                <RefreshCw size={36} color={C.blue} />
              )}
            </View>

            <Text style={styles.stateTitle}>
              {completed
                ? 'Synchronization Complete 🎉'
                : paused
                ? 'Sync Paused'
                : 'Uploading Field Data…'}
            </Text>

            <Text style={styles.stateSub}>
              {completed
                ? 'All selected samples and photos have been backed up.'
                : paused
                ? 'Upload progress is preserved. Tap resume whenever ready.'
                : 'Please keep the app open while uploading images.'}
            </Text>

            {/* Progress Card */}
            <View style={styles.progressCard}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Sample Progress</Text>
                <Text style={styles.progressVal}>
                  {uploadProgress.completedSamples + uploadProgress.failedSamples} /{' '}
                  {uploadProgress.totalSamples}
                </Text>
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Image Uploads</Text>
                <Text style={styles.progressVal}>
                  {uploadProgress.completedImages} / {uploadProgress.totalImages}
                </Text>
              </View>

              {/* Modern Progress Bar */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${Math.min(100, progressPercentage)}%` },
                    completed && { backgroundColor: C.green },
                  ]}
                />
              </View>

              <View style={styles.progressFooter}>
                <Text style={styles.percentageText}>{progressPercentage}%</Text>
                {!completed && uploadProgress.currentSample ? (
                  <Text style={styles.currentSampleText} numberOfLines={1}>
                    Sample: {uploadProgress.currentSample.slice(0, 16)}…
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Results breakdown if completed */}
            {completed ? (
              <View style={styles.resultBox}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultItemLabel}>Uploaded</Text>
                  <Text style={[styles.resultItemVal, { color: C.green }]}>
                    {uploadProgress.uploadedImages}
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultItemLabel}>Already Synced</Text>
                  <Text style={styles.resultItemVal}>{uploadProgress.skippedImages}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultItemLabel}>Failed</Text>
                  <Text
                    style={[
                      styles.resultItemVal,
                      uploadProgress.failedImages > 0 && { color: C.danger },
                    ]}
                  >
                    {uploadProgress.failedImages}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Controls */}
            {!completed ? (
              <View style={styles.controlGroup}>
                {paused ? (
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleResumeSync}
                    disabled={uploading}
                    activeOpacity={0.85}
                  >
                    <Play size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryBtnText}>Resume Sync</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.pauseBtn}
                    onPress={handlePause}
                    disabled={!uploading || isPausing}
                    activeOpacity={0.8}
                  >
                    <Pause size={18} color={C.navy} style={{ marginRight: 6 }} />
                    <Text style={styles.pauseBtnText}>
                      {isPausing ? 'Pausing Upload…' : 'Pause Sync'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.controlGroup}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleDone}
                  activeOpacity={0.85}
                >
                  <FileCheck2 size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryBtnText}>Done</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleStartAgain}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Sync Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.page,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },

  readyCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    gap: 12,
  },
  cloudIconBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: C.blueBorder,
    marginBottom: 4,
  },
  readyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.navy,
    textAlign: 'center',
  },
  readySub: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  metricBox: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '800',
    color: C.navy,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
  },
  metricDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#E2E8F0',
  },

  syncStateCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    gap: 12,
  },
  statusIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 4,
  },
  statusSyncing: {
    backgroundColor: C.blueLight,
    borderColor: C.blueBorder,
  },
  statusPaused: {
    backgroundColor: '#FEF9EC',
    borderColor: '#FDE68A',
  },
  statusCompleted: {
    backgroundColor: C.greenLight,
    borderColor: C.greenBorder,
  },

  stateTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.navy,
    textAlign: 'center',
  },
  stateSub: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },

  progressCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMuted,
  },
  progressVal: {
    fontSize: 13.5,
    fontWeight: '800',
    color: C.navy,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: C.blue,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: C.blue,
  },
  currentSampleText: {
    fontSize: 11,
    color: C.textMuted,
    maxWidth: '70%',
  },

  resultBox: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 12,
  },
  resultItem: {
    alignItems: 'center',
    gap: 2,
  },
  resultItemLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
  },
  resultItemVal: {
    fontSize: 16,
    fontWeight: '800',
    color: C.navy,
  },

  controlGroup: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  primaryBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.btnPrimary,
    borderRadius: 16,
    height: 54,
    shadowColor: C.btnShadow,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  btnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
  },

  pauseBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    height: 54,
  },
  pauseBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.navy,
  },

  cancelBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: C.card,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.navyMid,
  },
});
