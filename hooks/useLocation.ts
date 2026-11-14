import { useCallback, useRef, useState } from 'react';

import type { GpsCoordinates } from '@/services/locationService';
import {
  checkLocationServicesEnabled,
  requestLocationPermission,
  resolveCoordinates,
} from '@/services/locationService';

/** After this many seconds without a GPS fix we stop waiting and allow save. */
const GPS_TIMEOUT_MS = 20_000;

export function useLocationCapture() {
  const [coordinates, setCoordinates] = useState<GpsCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gpsTimedOut, setGpsTimedOut] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied'>(
    'undetermined'
  );
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(false);

  // Prevent duplicate inflight requests
  const inflight = useRef(false);

  const refreshStatus = useCallback(async () => {
    const enabled = await checkLocationServicesEnabled();
    setLocationServicesEnabled(enabled);
  }, []);

  const captureLocation = useCallback(async () => {
    // Don't fire if already running
    if (inflight.current) return null;
    inflight.current = true;

    setLoading(true);
    setError(null);
    setGpsTimedOut(false);

    // Start a timeout that enables saving even without GPS
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setGpsTimedOut(true);
      setError('GPS fix timed out. You can still save — coordinates will be recorded as unavailable.');
      inflight.current = false;
    }, GPS_TIMEOUT_MS);

    try {
      // Check if device location services are on
      const servicesEnabled = await checkLocationServicesEnabled();
      setLocationServicesEnabled(servicesEnabled);

      if (!servicesEnabled) {
        clearTimeout(timeoutId);
        setError('Device location services are off. GPS coordinates will not be recorded.');
        setGpsTimedOut(true);
        setLoading(false);
        inflight.current = false;
        return null;
      }

      // Request permission (won't prompt again if already granted)
      const status = await requestLocationPermission();
      setPermissionStatus(status);

      if (status !== 'granted') {
        clearTimeout(timeoutId);
        setError('Location permission denied. GPS coordinates will not be recorded.');
        setGpsTimedOut(true);
        setLoading(false);
        inflight.current = false;
        return null;
      }

      // Try to get coordinates
      const coords = await resolveCoordinates();
      clearTimeout(timeoutId);

      if (!coords) {
        setError('Unable to get GPS fix. You can still save without coordinates.');
        setGpsTimedOut(true);
        setCoordinates(null);
      } else {
        setCoordinates(coords);
        setError(null);
        setGpsTimedOut(false);
      }
      return coords;
    } catch (err) {
      clearTimeout(timeoutId);
      const message = err instanceof Error ? err.message : 'Failed to read GPS.';
      setError(message + ' You can still save without coordinates.');
      setGpsTimedOut(true);
      setCoordinates(null);
      return null;
    } finally {
      setLoading(false);
      inflight.current = false;
    }
  }, []);

  return {
    coordinates,
    loading,
    error,
    gpsTimedOut,
    permissionStatus,
    locationServicesEnabled,
    captureLocation,
    refreshStatus,
    setCoordinates,
  };
}
