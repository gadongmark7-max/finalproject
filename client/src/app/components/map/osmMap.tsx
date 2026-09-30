"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, LoaderCircle } from "lucide-react";
import { maplibregl } from "@/app/utils/maplibre";
import { createOsmStyle, OSM_SOURCE_ID } from "@/app/utils/mapMarker";
import type { LatLng } from "@/app/hooks/locationHooks";

export type OsmMapStatus = "loading" | "ready" | "error";

export const DEFAULT_MAP_CENTER: LatLng = { lat: 14.5995, lng: 120.9842 };

interface UseOsmMapOptions {
  center?: LatLng | null;
  zoom?: number;
  interactive?: boolean;
  navigation?: boolean;
}

export function useOsmMap({
  center,
  zoom = 13,
  interactive = true,
  navigation = interactive,
}: UseOsmMapOptions = {}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [styleReady, setStyleReady] = useState(false);
  const [status, setStatus] = useState<OsmMapStatus>("loading");
  const initialViewRef = useRef({ center, zoom });
  initialViewRef.current = { center, zoom };

  useEffect(() => {
    if (!container) return;
    const start = initialViewRef.current.center ?? DEFAULT_MAP_CENTER;
    setStatus("loading");

    let instance: maplibregl.Map;
    try {
      instance = new maplibregl.Map({
        container,
        style: createOsmStyle(),
        center: [start.lng, start.lat],
        zoom: initialViewRef.current.zoom,
        interactive,
        attributionControl: { compact: true },
      });
    } catch (e) {
      console.error(e);
      setStatus("error");
      return;
    }

    let tileLoaded = false;
    if (navigation) {
      instance.addControl(new maplibregl.NavigationControl(), "top-right");
    }
    instance.on("load", () => setStyleReady(true));
    instance.on("sourcedata", (e) => {
      if (e.sourceId !== OSM_SOURCE_ID || !e.tile || tileLoaded) return;
      tileLoaded = true;
      setStatus("ready");
    });
    instance.on("error", (e) => {
      console.error(e.error);
      if (!tileLoaded) setStatus("error");
    });

    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(container);
    setMap(instance);

    return () => {
      observer.disconnect();
      instance.remove();
      setMap(null);
      setStyleReady(false);
    };
  }, [container, interactive, navigation]);

  return { containerRef: setContainer, map, styleReady, status };
}

export function useAutoCenter(
  map: maplibregl.Map | null,
  candidates: (LatLng | null | undefined)[],
  zoom?: number,
) {
  const appliedRef = useRef(Number.POSITIVE_INFINITY);
  const key = candidates
    .map((c) => (c ? `${c.lat},${c.lng}` : ""))
    .join("|");

  useEffect(() => {
    appliedRef.current = Number.POSITIVE_INFINITY;
  }, [map]);

  useEffect(() => {
    if (!map) return;
    const index = candidates.findIndex(Boolean);
    if (index === -1 || index >= appliedRef.current) return;
    const target = candidates[index]!;
    appliedRef.current = index;
    map.jumpTo({
      center: [target.lng, target.lat],
      ...(zoom != null ? { zoom } : {}),
    });
  }, [map, key]);
}

interface OsmMapCanvasProps {
  containerRef: (el: HTMLDivElement | null) => void;
  status: OsmMapStatus;
}

export function OsmMapCanvas({ containerRef, status }: OsmMapCanvasProps) {
  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" />
      {status !== "ready" && (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-surface-alt/90 px-4 pointer-events-none">
          {status === "loading" ? (
            <div className="flex flex-col items-center gap-2 text-text-dim">
              <LoaderCircle className="w-5 h-5 text-gold animate-spin" />
              <span className="text-[10px] uppercase tracking-[0.2em]">
                Loading map…
              </span>
            </div>
          ) : (
            <div className="flex max-w-xs flex-col items-center gap-2 text-center">
              <AlertTriangle className="w-5 h-5 text-gold" />
              <span className="text-xs text-text-muted leading-relaxed">
                The map couldn&apos;t load. Check your connection and refresh
                the page.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
