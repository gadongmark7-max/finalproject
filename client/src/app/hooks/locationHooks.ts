import { useCallback, useEffect, useState } from "react";

export type LatLng = { lat: number; lng: number };

export type LocationErrorCode = "unsupported" | "denied" | "unavailable";

export const LOCATION_ERROR_MESSAGES: Record<LocationErrorCode, string> = {
  unsupported: "Your browser does not support location access.",
  denied:
    "Location permission was denied. Allow location access in your browser settings to see routes.",
  unavailable:
    "Your current location is unavailable right now. Check your connection or GPS and try again.",
};

export class LocationError extends Error {
  code: LocationErrorCode;

  constructor(code: LocationErrorCode) {
    super(LOCATION_ERROR_MESSAGES[code]);
    this.code = code;
  }
}

export function getCurrentPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new LocationError("unsupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) =>
        reject(
          new LocationError(
            err.code === err.PERMISSION_DENIED ? "denied" : "unavailable",
          ),
        ),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  });
}

export function useCurrentLocationState() {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [error, setError] = useState<LocationErrorCode | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await getCurrentPosition();
      setLocation(next);
      setError(null);
      return next;
    } catch (e) {
      const code = e instanceof LocationError ? e.code : "unavailable";
      setError(code);
      throw e instanceof LocationError ? e : new LocationError(code);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  return { location, error, refresh };
}

export function useCurrentLocation() {
  return useCurrentLocationState().location;
}

export default useCurrentLocation;
