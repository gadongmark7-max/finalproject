"use client";

import { useEffect, useMemo, useRef } from "react";
import { maplibregl } from "@/app/utils/maplibre";
import {
  accountInterface,
  artistInfoInterface,
  bussinessInfoInterface,
} from "@/app/types/accounts.type";
import { createAvatarMarkerElement } from "@/app/utils/mapMarker";
import { isValidCoordinate } from "@/app/utils/routing";
import {
  OsmMapCanvas,
  useAutoCenter,
  useOsmMap,
} from "@/app/components/map/osmMap";
import RoutingLayer, { RouteStatus } from "./routingMap";

interface ClientMapViewProps {
  currentLocation: { lat: number; lng: number } | null;
  userProfile: string;
  artistInfo?: artistInfoInterface[];
  bussinessInfo?: bussinessInfoInterface[];
  route: {
    id: number;
    from: { lat: number; lng: number };
    to: { lat: number; lng: number };
  } | null;
  onRouteStatusChange: (status: RouteStatus) => void;
  onSelectProfile: (
    userProfile: artistInfoInterface | bussinessInfoInterface,
    account: accountInterface,
  ) => void;
}

export default function ClientMapView({
  currentLocation,
  userProfile,
  artistInfo,
  bussinessInfo,
  route,
  onRouteStatusChange,
  onSelectProfile,
}: ClientMapViewProps) {
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const firstArtistLocation = useMemo(() => {
    const found = artistInfo?.find((a) =>
      isValidCoordinate(a.artist?.location?.lat, a.artist?.location?.long),
    );
    return found
      ? { lat: found.artist.location!.lat!, lng: found.artist.location!.long! }
      : null;
  }, [artistInfo]);

  const { containerRef, map, styleReady, status } = useOsmMap({
    center: currentLocation ?? firstArtistLocation,
  });

  useAutoCenter(map, [currentLocation, firstArtistLocation]);

  useEffect(() => {
    if (!map || !currentLocation) return;

    const el = createAvatarMarkerElement(userProfile);
    const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
      .setLngLat([currentLocation.lng, currentLocation.lat])
      .setPopup(
        new maplibregl.Popup({ offset: 32 }).setHTML(
          "<h1>your current location</h1>",
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

    artistInfo?.forEach((artist) => {
      if (!artist.artist?.location) return;
      const { lat, long } = artist.artist.location;
      if (!isValidCoordinate(lat, long)) return;

      const el = createAvatarMarkerElement(artist.artist.profile);
      el.addEventListener("click", () =>
        onSelectProfile(artist, artist.artist),
      );

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([long!, lat!])
        .addTo(map);

      markersRef.current.push(marker);
    });

    bussinessInfo?.forEach((bussiness) => {
      if (!bussiness.bussiness?.location) return;
      const { lat, long } = bussiness.bussiness.location;
      if (!isValidCoordinate(lat, long)) return;

      const el = createAvatarMarkerElement("/shop-logo.jpg");
      el.addEventListener("click", () =>
        onSelectProfile(bussiness, bussiness.bussiness),
      );

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([long!, lat!])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [map, artistInfo, bussinessInfo, onSelectProfile]);

  return (
    <>
      <OsmMapCanvas containerRef={containerRef} status={status} />
      {route && (
        <RoutingLayer
          key={route.id}
          map={styleReady ? map : null}
          from={route.from}
          to={route.to}
          onStatusChange={onRouteStatusChange}
        />
      )}
    </>
  );
}
