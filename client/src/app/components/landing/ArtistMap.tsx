"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import * as maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { Clock, MapPin, Navigation, Star } from "lucide-react"
import { artistInfoInterface } from "@/app/types/accounts.type"
import {
  createOsmStyle,
  createStudioMarkerElement,
  DEFAULT_PROFILE_IMAGE,
} from "@/app/utils/mapMarker"

interface ArtistMapProps {
  mapArtistInfo: artistInfoInterface[]
}

const DEFAULT_CENTER: [number, number] = [120.9842, 14.5995]

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

function formatHour(time: string): string {
  const [hour, minute] = time.split(":").map(Number)
  if (Number.isNaN(hour)) return time
  const suffix = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${String(minute || 0).padStart(2, "0")} ${suffix}`
}

function formatSchedule(a: artistInfoInterface) {
  const days = WEEK_DAYS.filter((d) => a.schedDay?.includes(d)).map((d) =>
    d.slice(0, 3)
  )
  const times = a.schedTime ?? []
  const hours =
    times.length > 0
      ? `${formatHour(times[0])} – ${formatHour(times[times.length - 1])}`
      : null
  return { days: days.join(" · "), hours }
}

function averageRating(a: artistInfoInterface) {
  const reviews = a.reviews ?? []
  if (reviews.length === 0) return null
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}

function directionsUrl(lat: number, long: number) {
  return `https://www.openstreetmap.org/directions?to=${lat}%2C${long}#map=16/${lat}/${long}`
}

function buildArtistPopupContent(a: artistInfoInterface): HTMLDivElement {
  const container = document.createElement("div")
  container.className = "flex items-center gap-3 min-w-[180px] max-w-[240px] font-sans"

  const img = document.createElement("img")
  img.src = a.artist.profile || DEFAULT_PROFILE_IMAGE
  img.alt = a.artist.name
  img.className = "w-10 h-10 rounded-full object-cover border border-gray-300 flex-shrink-0"
  img.onerror = () => {
    img.onerror = null
    img.src = DEFAULT_PROFILE_IMAGE
  }
  container.appendChild(img)

  const text = document.createElement("div")
  text.className = "min-w-0"

  const name = document.createElement("p")
  name.className = "font-semibold text-sm text-gray-900 truncate"
  name.textContent = a.artist.name
  text.appendChild(name)

  const type = document.createElement("p")
  type.className = "text-xs text-gray-600 capitalize"
  type.textContent = a.artist.type
  text.appendChild(type)

  container.appendChild(text)
  return container
}

function ArtistAvatar({ src, name }: { src?: string; name: string }) {
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_PROFILE_IMAGE)

  useEffect(() => {
    setImgSrc(src || DEFAULT_PROFILE_IMAGE)
  }, [src])

  return (
    <img
      src={imgSrc}
      alt={name}
      onError={() => {
        if (imgSrc !== DEFAULT_PROFILE_IMAGE) setImgSrc(DEFAULT_PROFILE_IMAGE)
      }}
      className="w-16 h-16 sm:w-20 sm:h-20 object-cover border border-border-gold flex-shrink-0 bg-surface-alt"
    />
  )
}

function ArtistCard({
  artistInfo,
  selected,
  selectable,
  onSelect,
}: {
  artistInfo: artistInfoInterface
  selected: boolean
  selectable: boolean
  onSelect: () => void
}) {
  const { artist, bio } = artistInfo
  const { days, hours } = formatSchedule(artistInfo)
  const rating = averageRating(artistInfo)
  const lat = artist.location!.lat!
  const long = artist.location!.long!

  return (
    <div
      role={selectable ? "button" : undefined}
      tabIndex={selectable ? 0 : undefined}
      onClick={selectable ? onSelect : undefined}
      onKeyDown={
        selectable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelect()
              }
            }
          : undefined
      }
      className={`relative group bg-surface border p-5 sm:p-6 transition-all duration-500 overflow-hidden ${
        selectable ? "cursor-pointer" : ""
      } ${selected ? "border-border-gold" : "border-border hover:border-border-gold"}`}
    >
      <div
        className={`absolute bottom-0 left-0 h-[1px] bg-gold transition-all duration-700 ${
          selected ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />

      <div className="flex items-start gap-4">
        <ArtistAvatar src={artist.profile} name={artist.name} />
        <div className="min-w-0 flex-1">
          <span className="text-[9px] uppercase tracking-[0.24em] text-gold">
            {artist.type === "artist" ? "Resident Artist" : artist.type}
          </span>
          <h3
            className="mt-1 text-2xl font-light text-text leading-tight truncate"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {artist.name}
          </h3>
          {rating != null && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-text-muted">
              <Star size={12} className="text-gold fill-current" />
              <span>{rating.toFixed(1)}</span>
              <span className="text-text-dim">
                ({artistInfo.reviews.length}{" "}
                {artistInfo.reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>
      </div>

      {bio && (
        <p className="mt-4 text-sm text-text-muted leading-relaxed line-clamp-3">
          {bio}
        </p>
      )}

      <div className="mt-5 space-y-2.5 border-t border-border pt-4">
        {(days || hours) && (
          <div className="flex items-start gap-2.5 text-xs text-text-muted">
            <Clock size={13} className="text-gold mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              {days && <p className="truncate">{days}</p>}
              {hours && <p className="text-text">{hours}</p>}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2.5 text-xs text-text-muted">
          <MapPin size={13} className="text-gold flex-shrink-0" />
          <span className="truncate">
            {lat.toFixed(5)}, {long.toFixed(5)}
          </span>
        </div>
      </div>

      <a
        href={directionsUrl(lat, long)}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="mt-5 flex items-center justify-center gap-2 border border-border-gold px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-gold hover:bg-gold hover:text-primary transition-colors duration-300"
      >
        <Navigation size={12} />
        Get directions
      </a>
    </div>
  )
}

export default function ArtistMap({ mapArtistInfo }: ArtistMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)
  const [map, setMap] = useState<maplibregl.Map | null>(null)
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map())
  const [selectedId, setSelectedId] = useState<string | null>(null)

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
      style: createOsmStyle(),
      center,
      zoom: 15,
    })

    instance.addControl(new maplibregl.NavigationControl(), "top-right")
    const observer = new ResizeObserver(() => instance.resize())
    observer.observe(containerRef.current)
    mapInstanceRef.current = instance
    setMap(instance)

    return () => {
      observer.disconnect()
      instance.remove()
      mapInstanceRef.current = null
      setMap(null)
    }
  }, [hasLocations])

  useEffect(() => {
    if (!map) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = new Map()

    artistsWithLocation.forEach((a) => {
      const marker = new maplibregl.Marker({
        element: createStudioMarkerElement(a.artist.profile),
        anchor: "bottom",
      })
        .setLngLat([a.artist.location!.long!, a.artist.location!.lat!])
        .setPopup(
          new maplibregl.Popup({ offset: 50, closeButton: false }).setDOMContent(
            buildArtistPopupContent(a)
          )
        )
        .addTo(map)

      markersRef.current.set(a._id, marker)
    })

    map.setCenter(center)
  }, [map, artistsWithLocation, center])

  const selectArtist = (a: artistInfoInterface) => {
    setSelectedId(a._id)
    if (!map) return
    map.flyTo({
      center: [a.artist.location!.long!, a.artist.location!.lat!],
      zoom: Math.max(map.getZoom(), 15),
    })
    markersRef.current.forEach((marker, id) => {
      const popup = marker.getPopup()
      if (id === a._id) {
        if (!popup?.isOpen()) marker.togglePopup()
      } else if (popup?.isOpen()) {
        popup.remove()
      }
    })
  }

  if (!hasLocations) {
    return (
      <div className="h-[420px] bg-surface-alt border border-border flex items-center justify-center">
        <p className="text-sm text-text-dim tracking-wider">
          No studio location set yet
        </p>
      </div>
    )
  }

  const selectable = artistsWithLocation.length > 1
  const activeId = selectedId ?? artistsWithLocation[0]._id

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
      <div className="relative h-[320px] sm:h-[420px] lg:h-auto lg:min-h-[460px] border border-border overflow-hidden bg-surface-alt order-2 lg:order-1">
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-primary/85 backdrop-blur-sm border border-border px-3 py-1.5 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="text-[9px] uppercase tracking-[0.2em] text-gold">
            {artistsWithLocation.length}{" "}
            {artistsWithLocation.length === 1 ? "location" : "locations"}
          </span>
        </div>
        <div ref={containerRef} className="absolute inset-0" />
      </div>

      <div className="order-1 lg:order-2 flex flex-col gap-4 lg:max-h-[560px] lg:overflow-y-auto">
        {artistsWithLocation.map((a) => (
          <ArtistCard
            key={a._id}
            artistInfo={a}
            selected={selectable && a._id === activeId}
            selectable={selectable}
            onSelect={() => selectArtist(a)}
          />
        ))}
      </div>
    </div>
  )
}
