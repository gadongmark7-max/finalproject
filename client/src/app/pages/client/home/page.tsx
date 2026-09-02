"use client"
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert } from "@/app/utils/alert";
import { artistInfoInterface, bussinessInfoInterface , accountInterface} from "@/app/types/accounts.type";
import useCurrentLocation from "@/app/hooks/locationHooks";
import { StarReviews } from "@/components/ui/starRating";
import Link from "next/link";
import { isNear, getDistance } from "@/app/utils/customFunction";
import { Search, Bell, User, MapPin, Star, Trophy, Medal, Award } from "lucide-react"

const banners = ["/web/banner1.jpg", "/web/banner2.jpg", "/web/banner3.jpg"]

const bannerLabels = [
  { tag: "Spotlight", title: "The Art of Precision Ink" },
  { tag: "New Collection", title: "Blackwork & Fine Line" },
  { tag: "Trending", title: "Illustrative & Botanical" },
]

const rankConfig = [
  { icon: Trophy, color: "text-gold", label: "1st Place", size: "lg" },
  { icon: Medal,  color: "text-text-muted", label: "2nd Place", size: "md" },
  { icon: Award,  color: "text-[#8B6914]", label: "3rd Place", size: "md" },
]

function NearbySkeletonCard() {
  return (
    <div className="relative flex-none w-36 sm:w-44 bg-surface border border-border p-4 overflow-hidden">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-surface-alt border border-border mb-3 animate-pulse" />
      <div className="h-3 bg-surface-alt rounded-none w-3/4 mb-2 animate-pulse" />
      <div className="h-2.5 bg-surface-alt rounded-none w-1/2 animate-pulse" />
      <div className="absolute top-2 right-2.5 w-8 h-10 bg-surface-alt animate-pulse opacity-40" />
    </div>
  )
}

export default function Page() {

  const currentLocation = useCurrentLocation()
  const [nearbyLoading, setNearbyLoading] = useState(true)
  const [nearestUsers, setNearestUsers] = useState<{ userProfile: bussinessInfoInterface | artistInfoInterface, account: accountInterface, distance: number }[]>([])

  const { data: artistInfo } = useQuery({
    queryKey: ['map_info_artist'],
    queryFn: async (): Promise<artistInfoInterface[]> => {
      const response = await axiosInstance.get(`/account/artistInfo`);
      return response.data;
    }
  });

  const { data: bussinessInfo } = useQuery({
    queryKey: ['map_info_bussiness'],
    queryFn: async (): Promise<bussinessInfoInterface[]> => {
      const response = await axiosInstance.get(`/account/bussinessInfo`);
      return response.data;
    }
  });

  const [topArtists, setTopArtist] = useState<artistInfoInterface[]>([])

  useEffect(() => {
    if (bussinessInfo && artistInfo) {
      const topArtists = artistInfo
        ? [...artistInfo]
          .sort((a, b) => {
            const avgA = a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length || 0;
            const avgB = b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length || 0;
            const scoreA = avgA * a.reviews.length;
            const scoreB = avgB * b.reviews.length;
            return scoreB - scoreA;
          })
          .slice(0, 3)
        : [];
      setTopArtist(topArtists);
    }

    if (bussinessInfo && artistInfo && currentLocation) {
      const radius = 5
      const allNearestUsers: { userProfile: bussinessInfoInterface | artistInfoInterface, account: accountInterface, distance: number }[] = []

      artistInfo.forEach((artist) => {
        if (!artist.artist.location) return null
        if (artist.artist.location?.lat != null && artist.artist.location?.long != null) {
          const targetLocation = { lat: artist.artist.location.lat, lng: artist.artist.location.long };
          if (isNear(currentLocation, targetLocation, radius)) {
            allNearestUsers.push({ userProfile: artist, account: artist.artist, distance: getDistance(currentLocation, targetLocation) })
          }
        }
      })

      bussinessInfo.forEach((bussiness) => {
        if (!bussiness.bussiness.location) return null
        if (bussiness.bussiness.location?.lat != null && bussiness.bussiness.location?.long != null) {
          const targetLocation = { lat: bussiness.bussiness.location.lat, lng: bussiness.bussiness.location.long };
          if (isNear(currentLocation, targetLocation, radius)) {
            allNearestUsers.push({ userProfile: bussiness, account: bussiness.bussiness, distance: getDistance(currentLocation, targetLocation) })
          }
        }
      })

      setNearestUsers(allNearestUsers)
      setNearbyLoading(false)
    }

    if (bussinessInfo && artistInfo && !currentLocation) {
      const timer = setTimeout(() => setNearbyLoading(false), 8000)
      return () => clearTimeout(timer)
    }
  }, [currentLocation, artistInfo, bussinessInfo])

  return (
    <div className="w-full min-h-dvh bg-primary relative overflow-x-hidden">

      {/* Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />
      {/* Ambient Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[300px] sm:h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* NAV */}
        <nav className="flex items-center justify-between py-5 sm:py-6 border-b border-border mb-8 sm:mb-12">
          <span className="font-[Cormorant_Garamond] font-light text-lg sm:text-xl tracking-[0.14em] uppercase text-gold">
            Ink Of Baphomet
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[Search, Bell, User].map((Icon, i) => (
              <button
                key={i}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-surface border border-border flex items-center justify-center hover:border-border-gold transition-colors duration-300"
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold" />
              </button>
            ))}
          </div>
        </nav>

        {/* WELCOME */}
        <section className="mb-10 sm:mb-14">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Welcome Back</span>
          </div>
          <h1 className="font-[Cormorant_Garamond] font-light text-4xl sm:text-5xl lg:text-7xl tracking-[-0.02em] text-text leading-[1.1] mb-4">
            Discover Your Next<br />
            <span className="text-gold">Masterpiece</span>
          </h1>
          <p className="text-text-muted text-sm leading-relaxed max-w-md">
            Connect with elite tattoo artists and studios near you. Browse portfolios, book consultations, and bring your vision to life.
          </p>
          <div className="flex gap-5 sm:gap-8 mt-6 sm:mt-7 pt-6 sm:pt-7 border-t border-border flex-wrap">
            {[["2.4k", "Artists"], ["840", "Studios"], ["18k", "Portfolio Works"]].map(([num, label]) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="font-[Cormorant_Garamond] font-light text-2xl sm:text-3xl tracking-[-0.02em] text-gold">{num}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* BANNERS */}
        <section className="mb-10 sm:mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Featured</span>
          </div>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-1">
            {banners.map((src, i) => (
              <div
                key={i}
                className={`relative flex-none ${i === 0 ? "w-[80%] sm:w-[75%]" : "w-[70%] sm:w-[60%]"} h-44 sm:h-64 lg:h-80 bg-surface border border-border overflow-hidden group cursor-pointer hover:border-border-gold transition-all duration-500`}
              >
                {i === 0 && (
                  <>
                    <div className="absolute top-0 left-0 w-10 h-10 sm:w-16 sm:h-16 border-t border-l border-gold opacity-40 z-10" />
                    <div className="absolute top-0 right-0 w-10 h-10 sm:w-16 sm:h-16 border-t border-r border-gold opacity-40 z-10" />
                    <div className="absolute bottom-0 left-0 w-10 h-10 sm:w-16 sm:h-16 border-b border-l border-gold opacity-40 z-10" />
                    <div className="absolute bottom-0 right-0 w-10 h-10 sm:w-16 sm:h-16 border-b border-r border-gold opacity-40 z-10" />
                  </>
                )}
                <img
                  src={src}
                  alt="banner"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-[1.03] transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 z-10">
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.24em] text-gold block mb-1 sm:mb-1.5">
                    {bannerLabels[i].tag}
                  </span>
                  <div className="font-[Cormorant_Garamond] font-light text-base sm:text-xl text-text tracking-[-0.01em]">
                    {bannerLabels[i].title}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-px w-0 bg-gold group-hover:w-full transition-all duration-700" />
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-border my-8 sm:my-12" />

        {/* NEARBY */}
        <section className="mb-10 sm:mb-12">
          <div className="flex items-end justify-between mb-4 sm:mb-5">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="h-px w-8 bg-gold" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">In Your Area</span>
              </div>
              <h2 className="font-[Cormorant_Garamond] font-light text-2xl sm:text-3xl tracking-[-0.02em] text-text">Nearby Studio</h2>
            </div>
          </div>

          <div className="flex gap-3 sm:gap-3.5 overflow-x-auto scrollbar-none pb-1">
            {nearbyLoading ? (
              /* Loading skeletons */
              Array.from({ length: 4 }).map((_, i) => <NearbySkeletonCard key={i} />)
            ) : nearestUsers.length === 0 ? (
              /* Empty state */
              <div className="w-full py-12 flex flex-col items-center justify-center border border-border bg-surface">
                <MapPin className="w-8 h-8 text-text-dim mb-3" />
                <p className="text-text-muted text-sm">No studios or artists found within 5 km</p>
                <p className="text-text-dim text-[11px] uppercase tracking-[0.18em] mt-1">Enable location for better results</p>
              </div>
            ) : (
              nearestUsers.map((a, i) => (
                <Link
                  href={`/pages/client/${a.account.type == "artist" ? "artistProfile" : "bussinessProfile"}/${a.account._id}`}
                  key={a.userProfile._id + i}
                  className="relative flex-none w-36 sm:w-44 bg-surface border border-border p-3 sm:p-4 group cursor-pointer hover:border-border-gold transition-all duration-500 overflow-hidden"
                >
                  <span className="absolute top-2 right-2 font-[Cormorant_Garamond] font-light text-4xl sm:text-5xl text-text-dim leading-none pointer-events-none select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-surface-alt border border-border overflow-hidden mb-2.5 sm:mb-3">
                    <img src={a.account.profile} alt={a.account.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs sm:text-sm text-text capitalize font-normal leading-tight mb-1.5 pr-4">{a.account.name}</p>
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                    <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gold flex-none" />
                    <span className="text-[10px] sm:text-[11px] text-gold tracking-wide">{a.distance.toFixed(2)} km</span>
                    <span className="w-1 h-1 bg-text-dim rounded-full" />
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.16em] text-text-muted">{a.account.type}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-gold group-hover:w-full transition-all duration-700" />
                </Link>
              ))
            )}
          </div>
        </section>

        <div className="h-px bg-border my-8 sm:my-12" />

        {/* TOP ARTISTS — RANKING LAYOUT */}
        <section className="mb-10 sm:mb-12">
          <div className="flex items-end justify-between mb-4 sm:mb-5">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="h-px w-8 bg-gold" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Most Acclaimed</span>
              </div>
              <h2 className="font-[Cormorant_Garamond] font-light text-2xl sm:text-3xl tracking-[-0.02em] text-text">Top 3 Artists</h2>
            </div>
            <button className="text-[10px] uppercase tracking-[0.24em] text-gold border-b border-gold-dim pb-0.5 hover:text-gold-light transition-colors">
              View All →
            </button>
          </div>

          {/* Podium ranking: 2nd | 1st | 3rd */}
          <div className="flex gap-2 sm:gap-3 items-end">

            {/* 2nd Place */}
            {topArtists[1] && (() => {
              const a = topArtists[1]
              const avg = a.reviews.length ? (a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length).toFixed(1) : "—"
              return (
                <Link
                  href={`/pages/client/artistProfile/${a.artist._id}`}
                  key={a._id + "1"}
                  className="relative flex-1 bg-surface border border-border group cursor-pointer hover:border-border-gold transition-all duration-500 overflow-hidden flex flex-col"
                  style={{ height: "clamp(200px, 30vw, 280px)" }}
                >
                  <img src={a.artist.profile} alt={a.artist.name} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-55 group-hover:scale-[1.04] transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
                  {/* Rank badge */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-center">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-surface-alt border border-border flex items-center justify-center mb-1">
                      <Medal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-muted" />
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-text-muted">2nd</span>
                  </div>
                  <div className="relative z-10 mt-auto p-2.5 sm:p-3">
                    <p className="text-[11px] sm:text-xs text-text capitalize font-normal leading-tight mb-1 truncate">{a.artist.name}</p>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-2.5 h-2.5 text-gold fill-gold" />
                      <span className="text-[10px] text-gold">{avg}</span>
                      <span className="text-[9px] text-white">({a.reviews.length}) sessions</span>
                    </div>
                    <StarReviews userProfile={a} />
                  </div>
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-gold group-hover:w-full transition-all duration-700" />
                </Link>
              )
            })()}

            {/* 1st Place — tallest */}
            {topArtists[0] && (() => {
              const a = topArtists[0]
              const avg = a.reviews.length ? (a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length).toFixed(1) : "—"
              return (
                <Link
                  href={`/pages/client/artistProfile/${a.artist._id}`}
                  key={a._id + "0"}
                  className="relative flex-[1.25] bg-surface border border-border-gold group cursor-pointer hover:border-gold transition-all duration-500 overflow-hidden flex flex-col"
                  style={{ height: "clamp(260px, 38vw, 360px)" }}
                >
                  {/* Gold corner brackets */}
                  <div className="absolute top-0 left-0 w-8 h-8 sm:w-10 sm:h-10 border-t border-l border-gold opacity-60 z-10" />
                  <div className="absolute top-0 right-0 w-8 h-8 sm:w-10 sm:h-10 border-t border-r border-gold opacity-60 z-10" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-10 sm:h-10 border-b border-l border-gold opacity-60 z-10" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 border-b border-r border-gold opacity-60 z-10" />
                  <img src={a.artist.profile} alt={a.artist.name} className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-72 group-hover:scale-[1.04] transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
                  {/* Crown badge */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gold/10 border border-gold flex items-center justify-center mb-1">
                      <Trophy className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gold" />
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.22em] text-gold">1st</span>
                  </div>
                  {/* Ambient glow inline */}
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(201,168,76,0.08) 0%, transparent 70%)" }} />
                  <div className="relative z-10 mt-auto p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-text capitalize font-normal leading-tight mb-1 truncate">{a.artist.name}</p>
                    <div className="flex items-center gap-1 mb-1.5">
                      <Star className="w-3 h-3 text-gold fill-gold" />
                      <span className="text-[11px] text-gold font-medium">{avg}</span>
                      <span className="text-[10px] text-white">({a.reviews.length} sessions)</span>
                    </div>
                    <StarReviews userProfile={a} />
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <div className="h-px flex-1 bg-gold opacity-30" />
                      <span className="text-[9px] uppercase tracking-[0.2em] text-gold">Top Artist</span>
                      <div className="h-px flex-1 bg-gold opacity-30" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-gold group-hover:w-full transition-all duration-700" />
                </Link>
              )
            })()}

            {/* 3rd Place */}
            {topArtists[2] && (() => {
              const a = topArtists[2]
              const avg = a.reviews.length ? (a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length).toFixed(1) : "—"
              return (
                <Link
                  href={`/pages/client/artistProfile/${a.artist._id}`}
                  key={a._id + "2"}
                  className="relative flex-1 bg-surface border border-border group cursor-pointer hover:border-border-gold transition-all duration-500 overflow-hidden flex flex-col"
                  style={{ height: "clamp(180px, 28vw, 260px)" }}
                >
                  <img src={a.artist.profile} alt={a.artist.name} className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-50 group-hover:scale-[1.04] transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
                  {/* Rank badge */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-center">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-surface-alt border border-border flex items-center justify-center mb-1">
                      <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-dim" />
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-text-muted">3rd</span>
                  </div>
                  <div className="relative z-10 mt-auto p-2.5 sm:p-3">
                    <p className="text-[11px] sm:text-xs text-text capitalize font-normal leading-tight mb-1 truncate">{a.artist.name}</p>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-2.5 h-2.5 text-gold fill-gold" />
                      <span className="text-[10px] text-gold">{avg}</span>
                      <span className="text-[9px] text-white">({a.reviews.length}) sessions</span>
                    </div>
                    <StarReviews userProfile={a} />
                  </div>
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-gold group-hover:w-full transition-all duration-700" />
                </Link>
              )
            })()}

          </div>
        </section>

      </div>
    </div>
  )
}