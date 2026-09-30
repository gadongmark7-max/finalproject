"use client";

import { useEffect, useRef } from "react";
import { maplibregl } from "@/app/utils/maplibre";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import {
  createAvatarMarkerElement,
  createStudioMarkerElement,
} from "@/app/utils/mapMarker";
import { isValidCoordinate } from "@/app/utils/routing";
import type { LatLng } from "@/app/hooks/locationHooks";
import {
  OsmMapCanvas,
  useAutoCenter,
  useOsmMap,
} from "@/app/components/map/osmMap";

interface ArtistMapViewProps {
  currentLocation: LatLng | null;
  studioLocation: LatLng | null;
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
  studioLocation,
  userProfile,
  bussinessInfo,
}: ArtistMapViewProps) {
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const { containerRef, map, status } = useOsmMap({
    center: currentLocation ?? studioLocation,
  });

  useAutoCenter(map, [currentLocation, studioLocation]);

  useEffect(() => {
    if (!map || !studioLocation) return;

    const marker = new maplibregl.Marker({
      element: createStudioMarkerElement(userProfile),
      anchor: "bottom",
    })
      .setLngLat([studioLocation.lng, studioLocation.lat])
      .setPopup(
        new maplibregl.Popup({ offset: 50 }).setHTML("<h1>Your Studio</h1>"),
      )
      .addTo(map);

    return () => {
      marker.remove();
    };
  }, [map, studioLocation?.lat, studioLocation?.lng, userProfile]);

  useEffect(() => {
    if (!map || !currentLocation) return;

    const el = createAvatarMarkerElement(userProfile);
    const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
      .setLngLat([currentLocation.lng, currentLocation.lat])
      .setPopup(
        new maplibregl.Popup({ offset: 32 }).setHTML(
          "<h1>Your Current Location</h1>",
        ),
      )
      .addTo(map);

    return () => {
      marker.remove();
    };
  }, [map, currentLocation?.lat, currentLocation?.lng, userProfile]);

  useEffect(() => {
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    bussinessInfo?.forEach((b) => {
      if (!b.bussiness.location) return;
      const { lat, long } = b.bussiness.location;
      if (!isValidCoordinate(lat, long)) return;

      const el = createAvatarMarkerElement("/shop-logo.jpg");
      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([long!, lat!])
        .setPopup(
          new maplibregl.Popup({ offset: 32 }).setDOMContent(
            buildBusinessPopupContent(b),
          ),
        )
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [map, bussinessInfo]);

  return <OsmMapCanvas containerRef={containerRef} status={status} />;
}
