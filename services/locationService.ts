import * as Location from 'expo-location';

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

/** Check if location services are enabled on the device */
export async function checkLocationServicesEnabled(): Promise<boolean> {
  try {
    return await Location.hasServicesEnabledAsync();
  } catch {
    return false;
  }
}

/** Request location permission only. */
export async function requestLocationPermission(): Promise<'undetermined' | 'granted' | 'denied'> {
  try {
    const current = await Location.getForegroundPermissionsAsync();
    if(current.status !== "granted"){
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status;
    }
    return current.status;
  } catch (error) {
    console.warn('Failed to request location permission:', error);
    return 'denied';
  }
}

/** Request permission and read current GPS coordinates. */
export async function getCurrentCoordinates(): Promise<GpsCoordinates | null> {
  try {
    const servicesEnabled = await checkLocationServicesEnabled();
    if (!servicesEnabled) {
      // Can't programmatically enable, so just return null - let UI handle showing error to user
      return null;
    }

    const status = await requestLocationPermission();

    if (status !== 'granted') {
      return null;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy ?? null,
    };
  } catch (error) {
    console.warn('Failed to get GPS coordinates:', error);
    return null;
  }
}

/** Best-effort last known location when fresh fix is unavailable. */
export async function getLastKnownCoordinates(): Promise<GpsCoordinates | null> {
  try {
    const servicesEnabled = await checkLocationServicesEnabled();
    if (!servicesEnabled) {
      return null;
    }

    const position = await Location.getLastKnownPositionAsync();

    if (!position) {
      return null;
    }

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy ?? null,
    };
  } catch {
    return null;
  }
}

/** Try current position first, then fall back to last known. */
export async function resolveCoordinates(): Promise<GpsCoordinates | null> {
  const current = await getCurrentCoordinates();
  if (current) return current;
  return getLastKnownCoordinates();
}
