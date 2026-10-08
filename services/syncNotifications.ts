import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const SYNC_CHANNEL_ID = 'cloud-sync';

let notificationsInitialized = false;

export async function initializeSyncNotifications(): Promise<boolean> {
  if (notificationsInitialized) {
    return true;
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(
        SYNC_CHANNEL_ID,
        {
          name: 'Cloud Sync',
          description:
            'Notifications about cloud synchronization.',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          sound: undefined,
        },
      );
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } =
        await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn(
        'Notification permission was not granted.',
      );

      return false;
    }

    notificationsInitialized = true;

    return true;
  } catch (error) {
    console.warn(
      'Failed to initialize notifications:',
      error,
    );

    return false;
  }
}

async function sendNotification(
  title: string,
  body: string,
): Promise<void> {
  const initialized =
    await initializeSyncNotifications();

  if (!initialized) {
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: 'cloud-sync',
        },
      },
      trigger: null,
    });
  } catch (error) {
    console.warn(
      'Failed to send sync notification:',
      error,
    );
  }
}

export async function notifySyncStarted(
  totalImages: number,
): Promise<void> {
  await sendNotification(
    'Cloud sync started',
    `Uploading ${totalImages} image(s) to the cloud.`,
  );
}

export async function notifySyncPaused(
  completedImages: number,
  totalImages: number,
): Promise<void> {
  await sendNotification(
    'Cloud sync paused',
    `${completedImages} of ${totalImages} image(s) have been processed.`,
  );
}

export async function notifySyncCompleted(
  uploadedImages: number,
  skippedImages: number,
  failedImages: number,
): Promise<void> {
  const totalProcessed =
    uploadedImages +
    skippedImages +
    failedImages;

  let body =
    `${totalProcessed} image(s) processed. ` +
    `${uploadedImages} uploaded.`;

  if (skippedImages > 0) {
    body += ` ${skippedImages} skipped.`;
  }

  if (failedImages > 0) {
    body += ` ${failedImages} failed.`;
  }

  await sendNotification(
    'Cloud sync completed',
    body,
  );
}

export async function notifySyncInterrupted(
  completedImages: number,
  totalImages: number,
): Promise<void> {
  await sendNotification(
    'Cloud sync interrupted',
    `${completedImages} of ${totalImages} image(s) were processed. You can resume the sync.`,
  );
}

export async function notifySyncFailed(
  message: string,
): Promise<void> {
  await sendNotification(
    'Cloud sync failed',
    message,
  );
}