"use client";
import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";

const ROUTE_SOURCE_ID = "client-route";
const ROUTE_LAYER_ID = "client-route-line";

interface RoutingLayerProps {
  map: maplibregl.Map | null;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
}

const RoutingControl: React.FC<RoutingLayerProps> = ({ map, from, to }) => {
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!map) return;
    cancelledRef.current = false;

    const drawRoute = (coordinates: [number, number][]) => {
      if (cancelledRef.current) return;

      const geojson = {
        type: "Feature" as const,
        properties: {},
        geometry: { type: "LineString" as const, coordinates },
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

      const bounds = coordinates.reduce(
        (b, coord) => b.extend(coord),
        new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
      );
      map.fitBounds(bounds, { padding: 60, maxZoom: 16 });
    };

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        const coordinates = data?.routes?.[0]?.geometry?.coordinates as
          | [number, number][]
          | undefined;
        if (coordinates?.length) drawRoute(coordinates);
      } catch (e) {
        console.error("failed to fetch route", e);
      }
    };

    if (map.isStyleLoaded()) fetchRoute();
    else map.once("load", fetchRoute);

    return () => {
      cancelledRef.current = true;
      if (map.getLayer(ROUTE_LAYER_ID)) map.removeLayer(ROUTE_LAYER_ID);
      if (map.getSource(ROUTE_SOURCE_ID)) map.removeSource(ROUTE_SOURCE_ID);
    };
  }, [map, from.lat, from.lng, to.lat, to.lng]);

  return null;
};

export default RoutingControl;
