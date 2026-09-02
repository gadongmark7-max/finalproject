"use client"

import { useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { artistInfoInterface } from "@/app/types/accounts.type"

interface ArtistMapProps {
  mapArtistInfo: artistInfoInterface[]
}

// Gold-tinted custom marker icon
const studioIcon = L.divIcon({
  html: `
    <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" fill="#C6A55C" stroke="#8B7332" stroke-width="1.5"/>
      <circle cx="18" cy="18" r="8" fill="#1a1a2e" stroke="#C6A55C" stroke-width="1.5"/>
      <path d="M18 12v12M12 18h12" stroke="#C6A55C" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -44],
  className: "",
})

const DEFAULT_CENTER: [number, number] = [14.5995, 120.9842] // Manila

export default function ArtistMap({ mapArtistInfo }: ArtistMapProps) {
  const artistsWithLocation = useMemo(
    () =>
      mapArtistInfo.filter(
        (a) =>
          a.artist.location?.lat != null &&
          a.artist.location?.long != null
      ),
    [mapArtistInfo]
  )

  const center: [number, number] = useMemo(() => {
    if (artistsWithLocation.length > 0) {
      const first = artistsWithLocation[0]
      return [first.artist.location!.lat!, first.artist.location!.long!]
    }
    return DEFAULT_CENTER
  }, [artistsWithLocation])

  if (artistsWithLocation.length === 0) {
    return (
      <div className="h-[420px] bg-surface-alt border border-border flex items-center justify-center">
        <p className="text-sm text-text-dim tracking-wider">
          No studio location set yet
        </p>
      </div>
    )
  }

  return (
    <div className="h-[420px] border border-border relative group overflow-hidden">
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-primary/85 backdrop-blur-sm border border-border px-3 py-1.5 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
        <span className="text-[9px] uppercase tracking-[0.2em] text-gold">
          {artistsWithLocation.length} {artistsWithLocation.length === 1 ? "location" : "locations"}
        </span>
      </div>
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        {artistsWithLocation.map((a) => (
          <Marker
            key={a._id}
            position={[a.artist.location!.lat!, a.artist.location!.long!]}
            icon={studioIcon}
          >
            <Popup>
              <div className="min-w-[180px] font-sans">
                <p className="font-semibold text-sm text-gray-900 mb-1">
                  {a.artist.name}
                </p>
                <p className="text-xs text-gray-600 capitalize">{a.artist.type}</p>
                {a.bio && (
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">
                    {a.bio}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
