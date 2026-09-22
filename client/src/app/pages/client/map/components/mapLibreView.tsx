"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  accountInterface,
  artistInfoInterface,
  bussinessInfoInterface,
} from "@/app/types/accounts.type";
import {
  createAvatarMarkerElement,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/app/utils/mapMarker";
import RoutingLayer from "./routingMap";

interface ClientMapViewProps {
  currentLocation: { lat: number; lng: number };
  userProfile: string;
  artistInfo?: artistInfoInterface[];
  bussinessInfo?: bussinessInfoInterface[];
  pointB: { lat: number; lng: number } | null;
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
  pointB,
  onSelectProfile,
}: ClientMapViewProps) {
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
          "<h1>your current location</h1>",
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

    artistInfo?.forEach((artist) => {
      if (!artist.artist?.location) return;
      const { lat, long } = artist.artist.location;
      if (lat == null || long == null) return;

      const el = createAvatarMarkerElement(artist.artist.profile);
      el.addEventListener("click", () =>
        onSelectProfile(artist, artist.artist),
      );

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([long, lat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    bussinessInfo?.forEach((bussiness) => {
      if (!bussiness.bussiness?.location) return;
      const { lat, long } = bussiness.bussiness.location;
      if (lat == null || long == null) return;

      const el = createAvatarMarkerElement("/shop-logo.jpg");
      el.addEventListener("click", () =>
        onSelectProfile(bussiness, bussiness.bussiness),
      );

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([long, lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [map, artistInfo, bussinessInfo, onSelectProfile]);

  return (
    <>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      {pointB && <RoutingLayer map={map} from={currentLocation} to={pointB} />}
    </>
  );
}
