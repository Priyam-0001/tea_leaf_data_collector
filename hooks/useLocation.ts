import { useCallback, useState } from 'react';

import type { GpsCoordinates } from '@/services/locationService';
import {
  checkLocationServicesEnabled,
  requestLocationPermission,
  resolveCoordinates
} from '@/services/locationService';

export function useLocationCapture() {
  const [coordinates, setCoordinates] = useState<GpsCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(false);

  const refreshStatus = useCallback(async () => {
    const enabled = await checkLocationServicesEnabled();
    setLocationServicesEnabled(enabled);
  }, []);

  const captureLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Check location services
      const servicesEnabled = await checkLocationServicesEnabled();
      setLocationServicesEnabled(servicesEnabled);
      
      if (!servicesEnabled) {
        setError('Please enable location services on your device to continue.');
        setCoordinates(null);
        return null;
      }
      // Request permission
      const status = await requestLocationPermission();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setError('Please grant location permission to continue.');
        setCoordinates(null);
        return null;
      }

      // Get fresh coordinates
      const coords = await resolveCoordinates();
      if (!coords) {
        setError('Unable to get GPS coordinates. Please try again.');
      }
      setCoordinates(coords);
      setError(null);
      return coords;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to read GPS.';
      setError(message);
      setCoordinates(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    coordinates,
    loading,
    error,
    permissionStatus,
    locationServicesEnabled,
    captureLocation,
    refreshStatus,
    setCoordinates,
  };
}
