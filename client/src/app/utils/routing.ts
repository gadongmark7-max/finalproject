import type { LatLng } from "@/app/hooks/locationHooks";

const OSRM_ROUTE_URL = "https://router.project-osrm.org/route/v1/driving";

export interface RouteResult {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
}

export class RouteError extends Error {}

export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

export async function fetchRoute(
  from: LatLng,
  to: LatLng,
  signal?: AbortSignal,
): Promise<RouteResult> {
  const url = `${OSRM_ROUTE_URL}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;

  let data: {
    code?: string;
    routes?: {
      distance?: number;
      duration?: number;
      geometry?: { coordinates?: [number, number][] };
    }[];
  };
  try {
    const res = await fetch(url, { signal });
    data = await res.json();
  } catch (e) {
    if ((e as Error)?.name === "AbortError") throw e;
    throw new RouteError(
      "Couldn't reach the routing service. Check your connection and try again.",
    );
  }

  const route = data?.routes?.[0];
  const coordinates = route?.geometry?.coordinates;
  if (data?.code === "NoRoute" || !route || !coordinates?.length) {
    throw new RouteError("No driving route could be found to this location.");
  }
  if (data?.code && data.code !== "Ok") {
    throw new RouteError("Couldn't calculate the route right now. Please try again.");
  }

  return {
    coordinates,
    distanceMeters: route.distance ?? 0,
    durationSeconds: route.duration ?? 0,
  };
}

export function formatRouteDistance(meters: number) {
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
}

export function formatRouteDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}
