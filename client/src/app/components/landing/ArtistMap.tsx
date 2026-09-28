"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import * as maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { artistInfoInterface } from "@/app/types/accounts.type"
import { OSM_ATTRIBUTION, OSM_TILE_URL } from "@/app/utils/mapMarker"

interface ArtistMapProps {
  mapArtistInfo: artistInfoInterface[]
}

const STUDIO_MARKER_SVG = `
  <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" fill="#C6A55C" stroke="#8B7332" stroke-width="1.5"/>
    <circle cx="18" cy="18" r="8" fill="#1a1a2e" stroke="#C6A55C" stroke-width="1.5"/>
    <path d="M18 12v12M12 18h12" stroke="#C6A55C" stroke-width="2" stroke-linecap="round"/>
  </svg>
`

const DEFAULT_CENTER: [number, number] = [120.9842, 14.5995]

function createStudioMarkerElement(): HTMLDivElement {
  const el = document.createElement("div")
  el.style.width = "36px"
  el.style.height = "44px"
  el.style.cursor = "pointer"
  el.innerHTML = STUDIO_MARKER_SVG
  return el
}

function buildArtistPopupContent(a: artistInfoInterface): HTMLDivElement {
  const container = document.createElement("div")
  container.className = "min-w-[180px] font-sans"

  const name = document.createElement("p")
  name.className = "font-semibold text-sm text-gray-900 mb-1"
  name.textContent = a.artist.name
  container.appendChild(name)

  const type = document.createElement("p")
  type.className = "text-xs text-gray-600 capitalize"
  type.textContent = a.artist.type
  container.appendChild(type)

  if (a.bio) {
    const bio = document.createElement("p")
    bio.className = "text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2"
    bio.textContent = a.bio
    container.appendChild(bio)
  }

  return container
}

export default function ArtistMap({ mapArtistInfo }: ArtistMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)
  const [map, setMap] = useState<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  const artistsWithLocation = useMemo(
    () =>
      mapArtistInfo.filter(
        (a) =>
          a?.artist?.location?.lat != null &&
          a?.artist?.location?.long != null
      ),
    [mapArtistInfo]
  )

  const center: [number, number] = useMemo(() => {
    if (artistsWithLocation.length > 0) {
      const first = artistsWithLocation[0]
      return [first.artist.location!.long!, first.artist.location!.lat!]
    }
    return DEFAULT_CENTER
  }, [artistsWithLocation])

  const hasLocations = artistsWithLocation.length > 0

  useEffect(() => {
    if (!hasLocations || !containerRef.current || mapInstanceRef.current) return

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
      center,
      zoom: 14,
    })

    instance.addControl(new maplibregl.NavigationControl(), "top-right")
    mapInstanceRef.current = instance
    setMap(instance)

    return () => {
      instance.remove()
      mapInstanceRef.current = null
      setMap(null)
    }
  }, [hasLocations])

  useEffect(() => {
    if (!map) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    artistsWithLocation.forEach((a) => {
      const marker = new maplibregl.Marker({
        element: createStudioMarkerElement(),
        anchor: "bottom",
      })
        .setLngLat([a.artist.location!.long!, a.artist.location!.lat!])
        .setPopup(
          new maplibregl.Popup({ offset: 44 }).setDOMContent(
            buildArtistPopupContent(a)
          )
        )
        .addTo(map)

      markersRef.current.push(marker)
    })

    map.setCenter(center)
  }, [map, artistsWithLocation, center])

  if (!hasLocations) {
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
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  )
}
