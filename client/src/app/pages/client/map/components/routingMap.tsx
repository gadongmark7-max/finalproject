"use client";
import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import { fetchRoute, RouteError, RouteResult } from "@/app/utils/routing";

const ROUTE_SOURCE_ID = "client-route";
const ROUTE_LAYER_ID = "client-route-line";

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
    if (map.getLayer(ROUTE_LAYER_ID)) map.removeLayer(ROUTE_LAYER_ID);
    if (map.getSource(ROUTE_SOURCE_ID)) map.removeSource(ROUTE_SOURCE_ID);
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

      const source = map.getSource(ROUTE_SOURCE_ID) as
        | maplibregl.GeoJSONSource
        | undefined;

      if (source) {
        source.setData(geojson);
      } else {
        map.addSource(ROUTE_SOURCE_ID, { type: "geojson", data: geojson });
        map.addLayer({
          id: ROUTE_LAYER_ID,
          type: "line",
          source: ROUTE_SOURCE_ID,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#1A1A1A", "line-width": 4 },
        });
      }

      const bounds = route.coordinates.reduce(
        (b, coord) => b.extend(coord),
        new maplibregl.LngLatBounds(
          [from.lng, from.lat],
          [from.lng, from.lat],
        ).extend([to.lng, to.lat]),
      );
      map.fitBounds(bounds, { padding: 80, maxZoom: 16 });
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

    if (map.isStyleLoaded()) run();
    else map.once("load", run);

    return () => {
      controller.abort();
      map.off("load", run);
      removeRoute(map);
    };
  }, [map, from.lat, from.lng, to.lat, to.lng]);

  return null;
};

export default RoutingControl;
