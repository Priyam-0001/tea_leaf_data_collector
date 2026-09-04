import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';

import { INSTALLATION_ID_KEY } from '@/constants/theme';
import type { DeviceInfo } from '@/types/sample';

let cachedDeviceInfo: DeviceInfo | null = null;

async function getOrCreateInstallationId(): Promise<string> {
  try {
    const existing = await SecureStore.getItemAsync(INSTALLATION_ID_KEY);
    if (existing) return existing;
  } catch {
    // SecureStore may fail on some platforms; fall through to generate new ID.
  }

  const newId = String(Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000);
  try {
    await SecureStore.setItemAsync(INSTALLATION_ID_KEY, newId);
  } catch {
    // Non-fatal: ID still returned for this session.
  }
  return newId;
}

/** Collect and cache device metadata on first launch. */
export async function initializeDeviceInfo(): Promise<DeviceInfo> {
  if (cachedDeviceInfo) return cachedDeviceInfo;

  const installationId = await getOrCreateInstallationId();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  cachedDeviceInfo = {
    manufacturer: Device.manufacturer ?? 'Unknown',
    model: Device.modelName ?? Device.deviceName ?? 'Unknown',
    osName: Device.osName ?? 'Unknown',
    osVersion: Device.osVersion ?? 'Unknown',
    installationId,
    appVersion,
  };

  return cachedDeviceInfo;
}

export function getCachedDeviceInfo(): DeviceInfo | null {
  return cachedDeviceInfo;
}

export async function getDeviceInfo(): Promise<DeviceInfo> {
  return cachedDeviceInfo ?? initializeDeviceInfo();
}
