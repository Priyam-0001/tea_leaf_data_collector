import { create } from 'zustand';

import type { DeviceInfo } from '@/types/sample';
import { initializeDeviceInfo } from '@/services/deviceService';

interface DeviceStore {
  deviceInfo: DeviceInfo | null;
  isReady: boolean;
  error: string | null;
  initialize: () => Promise<void>;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  deviceInfo: null,
  isReady: false,
  error: null,

  initialize: async () => {
    try {
      const deviceInfo = await initializeDeviceInfo();
      set({ deviceInfo, isReady: true, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize device info.';
      set({ error: message, isReady: true });
    }
  },
}));
