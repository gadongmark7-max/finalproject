"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import {
  createAvatarMarkerElement,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/app/utils/mapMarker";

interface ArtistMapViewProps {
  currentLocation: { lat: number; lng: number };
  userProfile: string;
  bussinessInfo?: bussinessInfoInterface[];
}

function buildBusinessPopupContent(b: bussinessInfoInterface): HTMLDivElement {
  const container = document.createElement("div");
  container.className =
    "p-3 flex flex-col gap-3 max-w-[280px] text-left rounded";

  const header = document.createElement("div");
  header.className = "flex items-center gap-2";
  header.innerHTML = `
    <a href="/pages/artist/bussinessProfile/${b.bussiness._id}" class="w-10 h-10">
      <img src="${b.bussiness.profile}" alt="${b.bussiness.name}" class="w-10 h-10 rounded-full object-cover border border-border" />
    </a>
    <h1 class="text-sm font-semibold">${b.bussiness.name}</h1>
  `;
  container.appendChild(header);

  if (b.isLookingArtist && b.jobDescription) {
    const hiring = document.createElement("div");
    hiring.className = "space-y-1";
    hiring.innerHTML = `
      <span class="text-[10px] text-green-600 font-semibold">Hiring</span>
      <pre class="text-xs text-text-muted whitespace-pre-wrap leading-relaxed">${b.jobDescription}</pre>
    `;
    container.appendChild(hiring);
  }

  return container;
}

export default function ArtistMapView({
  currentLocation,
  userProfile,
  bussinessInfo,
}: ArtistMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const currentMarkerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    const instance = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [OSM_TILE_URL],
            tileSize: 256,
            attribution: OSM_ATTRIBUTION,
          },
        },
        layers: [{ id: "osm-tiles", type: "raster", source: "osm" }],
      },
      center: [currentLocation.lng, currentLocation.lat],
      zoom: 13,
    });

    instance.addControl(new maplibregl.NavigationControl(), "top-right");
    mapInstanceRef.current = instance;
    setMap(instance);

    return () => {
      instance.remove();
      mapInstanceRef.current = null;
      setMap(null);
    };
  }, []);

  useEffect(() => {
    if (!map) return;
    if (currentMarkerRef.current) currentMarkerRef.current.remove();

    const el = createAvatarMarkerElement(userProfile);
    const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
      .setLngLat([currentLocation.lng, currentLocation.lat])
      .setPopup(
        new maplibregl.Popup({ offset: 32 }).setHTML(
          "<h1>Your Current Location</h1>",
        ),
      )
      .addTo(map);

    currentMarkerRef.current = marker;

    return () => {
      marker.remove();
    };
  }, [map, currentLocation.lat, currentLocation.lng, userProfile]);

  useEffect(() => {
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    bussinessInfo?.forEach((b) => {
      if (!b.bussiness.location) return;
      const { lat, long } = b.bussiness.location;
      if (lat == null || long == null) return;

      const el = createAvatarMarkerElement("/shop-logo.jpg");
      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([long, lat])
        .setPopup(
          new maplibregl.Popup({ offset: 32 }).setDOMContent(
            buildBusinessPopupContent(b),
          ),
        )
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [map, bussinessInfo]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
