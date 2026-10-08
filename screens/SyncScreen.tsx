import {
    ArrowLeft,
    CheckCircle2,
    Cloud,
    Pause,
    RefreshCw,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
    Alert,
    BackHandler,
    StyleSheet,
    Text,
    View,
    Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { ActionButton } from '@/components/ActionButton';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { useAlertStore } from '@/store/alertStore';
import { useSampleStore } from '@/store/sampleStore';
import {
    pauseUploads,
    uploadAllSamples,
} from '@/services/sampleUploadService';
import { ScrollView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { getSyncState } from '@/services/syncPersistence';
import { notifySyncStarted } from '@/services/syncNotifications';

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

    const [uploadProgress, setUploadProgress] =
        useState<UploadProgress>(initialProgress);

    const samplesWithImages = samples.filter(
        (sample) => sample.images.length > 0,
    ).length;

    const totalLocalImages = samples.reduce(
        (total, sample) => total + sample.images.length,
        0,
    );

    useEffect(() => {
        let mounted = true;

        async function restoreSyncState() {
            const state = await getSyncState();

            if (!state || !mounted) {
                return;
            }

            setHasStarted(true);
            setCompleted(false);

            // If the app was killed while the sync was running,
            // it obviously isn't running anymore.
            setPaused(true);

            setUploadProgress({
                totalSamples: state.totalSamples,
                completedSamples:
                    state.stats.completedSamples,

                currentSample: state.currentSample,

                uploadedImages:
                    state.stats.uploadedImages,

                skippedImages:
                    state.stats.skippedImages,

                failedImages:
                    state.stats.failedImages,

                failedSamples:
                    state.stats.failedSamples,

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

    const progressPercentage =
        uploadProgress.totalImages > 0
            ? Math.round(
                (uploadProgress.completedImages /
                    uploadProgress.totalImages) *
                100,
            )
            : 0;

    const handleBack = useCallback(() => {
        if (uploading) {
            Alert.alert(
                'Upload in progress',
                'Please pause the sync before leaving this screen.',
                [
                    {
                        text: 'OK',
                    },
                ],
            );

            return true;
        }

        router.back();
        return true;
    }, [uploading]);

    useFocusEffect(
        useCallback(() => {
            const subscription = BackHandler.addEventListener(
                'hardwareBackPress',
                handleBack,
            );

            return () => subscription.remove();
        }, [handleBack]),
    );

    const handleStartSync = async () => {
        if (uploading) {
            return;
        }

        try {
            setUploading(true);
            setPaused(false);
            setHasStarted(true);
            setCompleted(false);

            showAlert(
                'info',
                'Cloud sync started. Uploading your samples...',
            );

            await notifySyncStarted(totalLocalImages);

            const result = await uploadAllSamples((progress) => {
                setUploadProgress(progress);
            });

            if (result.paused) {
                setPaused(true);

                showAlert(
                    'warning',
                    'Cloud sync paused.',
                );

                return;
            }

            setPaused(false);
            setCompleted(true);

            if (result.failedSamples > 0) {
                showAlert(
                    'warning',
                    `Sync completed with ${result.failedSamples} failed sample(s).`,
                );
            } else {
                showAlert(
                    'success',
                    `Cloud sync completed. ${result.uploadedImages} image(s) uploaded.`,
                );
            }
        } catch (error) {
            console.error('SYNC ERROR:', error);

            showAlert(
                'error',
                error instanceof Error
                    ? error.message
                    : 'Unable to sync samples.',
            );
        } finally {
            setUploading(false);
        }
    };

    const handlePause = () => {
        pauseUploads();

        showAlert(
            'warning',
            'Pause requested. The current image will finish first.',
        );
    };

    const handleResumeSync = async () => {
        if (uploading) {
            return;
        }

        try {
            setUploading(true);
            setPaused(false);

            const result = await uploadAllSamples(
                (progress) => {
                    setUploadProgress(progress);
                },
                {
                    resume: true,
                },
            );

            if (result.paused) {
                setPaused(true);
                return;
            }

            setPaused(false);
            setCompleted(true);
        } catch (error) {
            console.error(
                'RESUME SYNC ERROR:',
                error,
            );

            setPaused(true);

            showAlert(
                'error',
                error instanceof Error
                    ? error.message
                    : 'Unable to resume sync.',
            );
        } finally {
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
    };

    const renderReadyState = () => (
        <View style={styles.stateContainer}>
            <View style={styles.largeIconContainer}>
                <Cloud
                    size={42}
                    color={COLORS.primary}
                />
            </View>

            <Text style={styles.stateTitle}>
                Ready to sync
            </Text>

            <Text style={styles.stateDescription}>
                Upload your locally stored samples and images
                to the cloud.
            </Text>

            <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                        Samples
                    </Text>

                    <Text style={styles.summaryValue}>
                        {samplesWithImages}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                        Images
                    </Text>

                    <Text style={styles.summaryValue}>
                        {totalLocalImages}
                    </Text>
                </View>
            </View>

            <ActionButton
                label="Start Sync"
                onPress={handleStartSync}
                disabled={samplesWithImages === 0}
                variant="tertiary"
            />

            {samplesWithImages === 0 && (
                <Text style={styles.emptyText}>
                    No samples with images are ready to sync.
                </Text>
            )}
        </View>
    );

    const renderSyncState = () => (
        <View style={styles.stateContainer}>
            <View style={styles.syncIconContainer}>
                {paused ? (
                    <Pause
                        size={38}
                        color={COLORS.textSecondary}
                    />
                ) : completed ? (
                    <CheckCircle2
                        size={42}
                        color={COLORS.primary}
                    />
                ) : (
                    <RefreshCw
                        size={38}
                        color={COLORS.primary}
                    />
                )}
            </View>

            <Text style={styles.stateTitle}>
                {paused
                    ? 'Sync Paused'
                    : completed
                        ? 'Sync Complete'
                        : 'Syncing data...'}
            </Text>

            <Text style={styles.stateDescription}>
                {paused
                    ? 'Your current progress has been retained.'
                    : completed
                        ? 'Your synchronization process has finished.'
                        : 'Please keep the app open while the sync is running.'}
            </Text>

            <View style={styles.progressCard}>
                <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>
                        Samples
                    </Text>

                    <Text style={styles.progressValue}>
                        {uploadProgress.completedSamples} /{' '}
                        {uploadProgress.totalSamples}
                    </Text>
                </View>

                <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>
                        Images
                    </Text>

                    <Text style={styles.progressValue}>
                        {uploadProgress.completedImages} /{' '}
                        {uploadProgress.totalImages}
                    </Text>
                </View>

                <View style={styles.progressBackground}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${Math.min(
                                    100,
                                    progressPercentage,
                                )}%`,
                            },
                        ]}
                    />
                </View>

                <View style={styles.progressFooter}>
                    <Text style={styles.percentage}>
                        {progressPercentage}%
                    </Text>

                    {!completed &&
                        uploadProgress.currentSample && (
                            <Text
                                style={styles.currentSample}
                                numberOfLines={1}
                            >
                                Sample: {uploadProgress.currentSample}
                            </Text>
                        )}
                </View>
            </View>

            {completed && (
                <View style={styles.resultCard}>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>
                            Uploaded
                        </Text>

                        <Text style={styles.resultValue}>
                            {uploadProgress.uploadedImages}
                        </Text>
                    </View>

                    <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>
                            Already synced
                        </Text>

                        <Text style={styles.resultValue}>
                            {uploadProgress.skippedImages}
                        </Text>
                    </View>

                    <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>
                            Failed
                        </Text>

                        <Text
                            style={[
                                styles.resultValue,
                                uploadProgress.failedSamples > 0 &&
                                styles.failedValue,
                            ]}
                        >
                            {uploadProgress.failedSamples}
                        </Text>
                    </View>
                </View>
            )}

            {!completed && (
                <View style={styles.actionRow}>
                    {paused ? (
                        <ActionButton
                            label="Resume Sync"
                            onPress={handleResumeSync}
                            disabled={uploading}
                            variant="tertiary"
                            style={styles.mainAction}
                        />
                    ) : (
                        <ActionButton
                            label="Pause Sync"
                            onPress={handlePause}
                            disabled={!uploading}
                            variant="secondary"
                            style={styles.mainAction}
                        />
                    )}
                </View>
            )}

            {completed && (
                <View style={styles.completedActions}>
                    <ActionButton
                        label="Done"
                        onPress={handleDone}
                        variant="tertiary"
                    />

                    <ActionButton
                        label="Sync Again"
                        onPress={handleStartAgain}
                        variant="secondary"
                    />
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.page}>
            <ScrollView>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Pressable
                            onPress={handleBack}
                            disabled={uploading}
                            style={styles.backButton}
                            hitSlop={10}
                        >
                            <ArrowLeft
                                size={24}
                                color={
                                    uploading
                                        ? COLORS.textSecondary
                                        : COLORS.text
                                }
                            />
                        </Pressable>

                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>
                                Cloud Sync
                            </Text>

                            <Text style={styles.headerSubtitle}>
                                Synchronize your field data
                            </Text>
                        </View>
                    </View>

                    <View style={styles.content}>
                        {!hasStarted
                            ? renderReadyState()
                            : renderSyncState()}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    container: {
        flex: 1,
        padding: SPACING.xl,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },

    backButton: {
        flex: 0,
    },

    headerTitleContainer: {
        flex: 1,
    },

    headerTitle: {
        fontSize: FONT_SIZES.title,
        fontWeight: '700',
        color: COLORS.primary,
    },

    headerSubtitle: {
        fontSize: FONT_SIZES.body,
        color: COLORS.textSecondary,
        marginTop: 2,
    },

    content: {
        flex: 1,
        justifyContent: 'center',
    },

    stateContainer: {
        gap: SPACING.lg,
    },

    largeIconContainer: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: COLORS.surface,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },

    syncIconContainer: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: COLORS.surface,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },

    stateTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'center',
    },

    stateDescription: {
        fontSize: FONT_SIZES.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },

    summaryCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        padding: SPACING.lg,
    },

    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },

    summaryLabel: {
        fontSize: FONT_SIZES.body,
        color: COLORS.textSecondary,
    },

    summaryValue: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.primary,
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.background,
    },

    emptyText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },

    progressCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        padding: SPACING.lg,
        gap: SPACING.md,
    },

    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    progressLabel: {
        fontSize: FONT_SIZES.body,
        color: COLORS.textSecondary,
    },

    progressValue: {
        fontSize: FONT_SIZES.body,
        fontWeight: '700',
        color: COLORS.text,
    },

    progressBackground: {
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.background,
        overflow: 'hidden',
    },

    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 5,
    },

    progressFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    percentage: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },

    currentSample: {
        flex: 1,
        marginLeft: SPACING.md,
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'right',
    },

    resultCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        padding: SPACING.lg,
        gap: SPACING.sm,
    },

    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    resultLabel: {
        fontSize: FONT_SIZES.body,
        color: COLORS.textSecondary,
    },

    resultValue: {
        fontSize: FONT_SIZES.body,
        fontWeight: '700',
        color: COLORS.primary,
    },

    failedValue: {
        color: '#DB2424',
    },

    actionRow: {
        flexDirection: 'row',
    },

    mainAction: {
        flex: 1,
    },

    completedActions: {
        gap: SPACING.sm,
    },
});