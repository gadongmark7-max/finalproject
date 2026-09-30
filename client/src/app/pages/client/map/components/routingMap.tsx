"use client";
import { useEffect, useRef } from "react";
import { maplibregl } from "@/app/utils/maplibre";
import { fetchRoute, RouteError, RouteResult } from "@/app/utils/routing";

const ROUTE_SOURCE_ID = "client-route";
const ROUTE_LAYER_ID = "client-route-line";
const ROUTE_CASING_LAYER_ID = "client-route-casing";
const ROUTE_ENDPOINTS_SOURCE_ID = "client-route-endpoints";
const ROUTE_ENDPOINTS_LAYER_ID = "client-route-endpoints";
const ROUTE_COLOR = "#1A73E8";
const ROUTE_CASING_COLOR = "#0B4FB3";

export type RouteStatus =
  | { state: "loading" }
  | { state: "ready"; distanceMeters: number; durationSeconds: number }
  | { state: "error"; message: string };

interface RoutingLayerProps {
  map: maplibregl.Map | null;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  onStatusChange?: (status: RouteStatus) => void;
}

const removeRoute = (map: maplibregl.Map) => {
  try {
    [ROUTE_ENDPOINTS_LAYER_ID, ROUTE_LAYER_ID, ROUTE_CASING_LAYER_ID].forEach(
      (id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      },
    );
    [ROUTE_SOURCE_ID, ROUTE_ENDPOINTS_SOURCE_ID].forEach((id) => {
      if (map.getSource(id)) map.removeSource(id);
    });
  } catch {}
};

const RoutingControl: React.FC<RoutingLayerProps> = ({
  map,
  from,
  to,
  onStatusChange,
}) => {
  const onStatusRef = useRef(onStatusChange);
  onStatusRef.current = onStatusChange;

  useEffect(() => {
    if (!map) return;
    const controller = new AbortController();

    const drawRoute = (route: RouteResult) => {
      const geojson = {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: route.coordinates,
        },
      };

      const endpoints = {
        type: "FeatureCollection" as const,
        features: [
          {
            type: "Feature" as const,
            properties: { role: "start" },
            geometry: {
              type: "Point" as const,
              coordinates: route.coordinates[0],
            },
          },
          {
            type: "Feature" as const,
            properties: { role: "end" },
            geometry: {
              type: "Point" as const,
              coordinates: route.coordinates[route.coordinates.length - 1],
            },
          },
        ],
      };

      removeRoute(map);
      map.addSource(ROUTE_SOURCE_ID, { type: "geojson", data: geojson });
      map.addSource(ROUTE_ENDPOINTS_SOURCE_ID, {
        type: "geojson",
        data: endpoints,
      });
      map.addLayer({
        id: ROUTE_CASING_LAYER_ID,
        type: "line",
        source: ROUTE_SOURCE_ID,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": ROUTE_CASING_COLOR,
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 6, 16, 12],
          "line-opacity": 0.9,
        },
      });
      map.addLayer({
        id: ROUTE_LAYER_ID,
        type: "line",
        source: ROUTE_SOURCE_ID,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": ROUTE_COLOR,
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 4, 16, 8],
        },
      });
      map.addLayer({
        id: ROUTE_ENDPOINTS_LAYER_ID,
        type: "circle",
        source: ROUTE_ENDPOINTS_SOURCE_ID,
        paint: {
          "circle-radius": 6,
          "circle-color": [
            "match",
            ["get", "role"],
            "start",
            ROUTE_COLOR,
            "#FFFFFF",
          ],
          "circle-stroke-color": [
            "match",
            ["get", "role"],
            "start",
            "#FFFFFF",
            ROUTE_COLOR,
          ],
          "circle-stroke-width": 3,
        },
      });

      const bounds = route.coordinates.reduce(
        (b, coord) => b.extend(coord),
        new maplibregl.LngLatBounds(
          [from.lng, from.lat],
          [from.lng, from.lat],
        ).extend([to.lng, to.lat]),
      );
      const { clientWidth, clientHeight } = map.getContainer();
      const side = Math.min(80, Math.max(24, clientWidth * 0.1));
      const top = Math.min(130, Math.max(80, clientHeight * 0.14));
      const bottom =
        clientWidth < 1024
          ? Math.min(300, Math.max(top, clientHeight * 0.4))
          : Math.min(180, Math.max(top, clientHeight * 0.25));
      map.fitBounds(bounds, {
        padding: { top, bottom, left: side, right: side },
        maxZoom: 16,
        duration: 800,
      });
    };

    const run = async () => {
      onStatusRef.current?.({ state: "loading" });
      try {
        const route = await fetchRoute(from, to, controller.signal);
        if (controller.signal.aborted) return;
        drawRoute(route);
        onStatusRef.current?.({
          state: "ready",
          distanceMeters: route.distanceMeters,
          durationSeconds: route.durationSeconds,
        });
      } catch (e) {
        if (controller.signal.aborted) return;
        removeRoute(map);
        onStatusRef.current?.({
          state: "error",
          message:
            e instanceof RouteError
              ? e.message
              : "Couldn't calculate the route right now. Please try again.",
        });
      }
    };

    run();

    return () => {
      controller.abort();
      removeRoute(map);
    };
  }, [map, from.lat, from.lng, to.lat, to.lng]);

  return null;
};

export default RoutingControl;
