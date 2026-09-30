"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin, Pencil, ExternalLink } from "lucide-react";
import { artistInfoInterface } from "@/app/types/accounts.type";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert } from "@/app/utils/alert";
import {
  createOsmStyle,
  createStudioMarkerElement,
} from "@/app/utils/mapMarker";

type LatLong = { lat: number; long: number };

interface ClickableMapProps {
  artistInfo: artistInfoInterface;
  setArtistInfo: (data: artistInfoInterface) => void;
}

interface StudioMapProps {
  position: LatLong | null;
  profile: string;
  interactive: boolean;
  onPick?: (position: LatLong) => void;
}

const DEFAULT_POSITION: LatLong = {
  lat: 14.315885007395133,
  long: 120.94680688824083,
};

function toLatLong(
  location: artistInfoInterface["artist"]["location"],
): LatLong | null {
  if (location?.lat == null || location?.long == null) return null;
  return { lat: location.lat, long: location.long };
}

function StudioMap({ position, profile, interactive, onPick }: StudioMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    if (!containerRef.current) return;
    const start = position ?? DEFAULT_POSITION;

    const instance = new maplibregl.Map({
      container: containerRef.current,
      style: createOsmStyle(),
      center: [start.long, start.lat],
      zoom: position ? 15 : 13,
      interactive,
      attributionControl: { compact: true },
    });

    if (interactive) {
      instance.addControl(new maplibregl.NavigationControl(), "top-right");
      instance.on("click", (e) =>
        onPickRef.current?.({ lat: e.lngLat.lat, long: e.lngLat.lng }),
      );
    }

    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(containerRef.current);
    setMap(instance);

    return () => {
      observer.disconnect();
      instance.remove();
      markerRef.current = null;
      setMap(null);
    };
  }, [interactive]);

  useEffect(() => {
    if (!map) return;
    markerRef.current?.remove();
    markerRef.current = null;
    if (!position) return;

    const marker = new maplibregl.Marker({
      element: createStudioMarkerElement(profile),
      anchor: "bottom",
      draggable: interactive,
    })
      .setLngLat([position.long, position.lat])
      .addTo(map);

    if (interactive) {
      marker.on("dragend", () => {
        const { lat, lng } = marker.getLngLat();
        onPickRef.current?.({ lat, long: lng });
      });
    } else {
      map.jumpTo({ center: [position.long, position.lat] });
    }

    markerRef.current = marker;
  }, [map, position?.lat, position?.long, profile, interactive]);

  return <div ref={containerRef} className="absolute inset-0" />;
}

const MapLocation: React.FC<ClickableMapProps> = ({
  artistInfo,
  setArtistInfo,
}) => {
  const location = toLatLong(artistInfo.artist.location);
  const profile = artistInfo.artist.profile;

  const [mapLocation, setMapLocation] = useState<LatLong | null>(location);
  const [open, setOpen] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (next) setMapLocation(location);
    setOpen(next);
  };

  const updateMutation = useMutation({
    mutationFn: (location: LatLong) =>
      axiosInstance.put(`/account/location/${artistInfo.artist._id}`, {
        location,
        artistId: artistInfo._id,
      }),
    onSuccess: (response) => {
      setArtistInfo(response.data.accountInfo);
      setOpen(false);
      successAlert("location updated");
    },
    onError: () => errorAlert("error occur"),
  });

  const handleUpdateLocation = () => {
    if (!mapLocation) return errorAlert("please select location");
    updateMutation.mutate(mapLocation);
  };

  const formatCoords = (p: LatLong) =>
    `${p.lat.toFixed(5)}, ${p.long.toFixed(5)}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div className="flex flex-col gap-3 h-full">
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label="Edit studio location"
            className="group/map relative w-full h-[220px] sm:h-[200px] lg:h-[216px] overflow-hidden border border-border bg-surface-alt text-left cursor-pointer focus-visible:outline-none focus-visible:border-gold"
          >
            {location ? (
              <StudioMap
                position={location}
                profile={profile}
                interactive={false}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-muted">
                <MapPin size={18} className="text-gold" />
                <span className="text-[10px] uppercase tracking-[0.2em]">
                  Pin your studio location
                </span>
              </div>
            )}
            <span className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-primary/85 backdrop-blur-sm border border-border px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-gold opacity-100 sm:opacity-0 sm:group-hover/map:opacity-100 sm:group-focus-visible/map:opacity-100 transition-opacity duration-300 pointer-events-none">
              <Pencil size={10} />
              Edit location
            </span>
          </button>
        </DialogTrigger>

        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={12} className="text-gold flex-shrink-0" />
            <span className="text-xs text-text-muted truncate">
              {location ? formatCoords(location) : "No location set"}
            </span>
          </div>
          {location && (
            <a
              href={`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.long}#map=17/${location.lat}/${location.long}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-gold hover:text-gold-light flex-shrink-0"
            >
              Open
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>

      <DialogContent className="sm:max-w-[825px]">
        <DialogHeader>
          <DialogTitle>Studio Location</DialogTitle>
          <DialogDescription>
            Click the map or drag the marker to set your studio location.
          </DialogDescription>
        </DialogHeader>
        <div className="relative w-full h-[50dvh] sm:h-[440px] overflow-hidden border border-border bg-surface-alt">
          {open && (
            <StudioMap
              position={mapLocation}
              profile={profile}
              interactive
              onPick={setMapLocation}
            />
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={12} className="text-gold flex-shrink-0" />
            <span className="text-xs text-text-muted truncate">
              {mapLocation ? formatCoords(mapLocation) : "No location selected"}
            </span>
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={handleUpdateLocation}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save location"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapLocation;
