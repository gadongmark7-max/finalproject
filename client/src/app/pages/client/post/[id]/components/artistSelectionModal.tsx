"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { CalendarIcon } from "lucide-react"

import { bussinessInfoInterface, artistInfoInterface } from "@/app/types/accounts.type"
import { postInterface } from "@/app/types/post.type"
import { TattooDataInterface } from "@/app/types/threejs.type"

import { ArtistBookModal } from "./bookModalArtist"
import { SetTattoo3DModal } from "@/app/3d/3dTattooModal"

export function ArtistSelectionModal({ post, type  }: { post: postInterface, type : string }) {
  const [open, setOpen] = useState(false)
  const [tattooData, setTatooData] = useState<TattooDataInterface | null>(null)
  const [artistIndex, setArtistIndex] = useState<number | null>(null)

  const { data: bussinessInfoData } = useQuery({
    queryKey: ["bussiness_profile"],
    queryFn: async (): Promise<bussinessInfoInterface> => {
      const response = await axiosInstance.get(
        `/account/bussinessInfo/${post.account._id}`
      )
      return response.data
    },
    enabled : type == "bussiness"
  })

  const { data: artistInfo } = useQuery({
    queryKey: ['artistInfo'],
    queryFn: async (): Promise<artistInfoInterface> => {
      const response = await axiosInstance.get(`/account/artistInfo/${post?.account._id}`)
      return response.data
    },
    enabled: post?.account.type == "artist"
  })

  const validation = (): boolean => {
    if (type === "artist") {
      return !!artistInfo && !!tattooData
    }
    return artistIndex !== null && !!bussinessInfoData && !!tattooData
  };
  

  const getTimes = () => (type == "bussiness") ? bussinessInfoData!.artists[artistIndex!].schedTime :  artistInfo!.schedTime
  const getDays = () => (type == "bussiness") ? bussinessInfoData!.artists[artistIndex!].schedDay : artistInfo!.schedDay
  const getArtistId = () => (type == "bussiness") ? bussinessInfoData!.artists[artistIndex!].artist._id : artistInfo!.artist._id
  const getBussinessId = () =>  (type == "bussiness") ? post.account._id : null
  const getKey = () =>  (type == "bussiness") ? bussinessInfoData!.artists[artistIndex!]!.artist._id : artistInfo!.artist._id

  return (
    <>
      {/* OPEN BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] px-5 py-3 border border-gold text-gold hover:bg-gold hover:text-primary transition-all duration-200"
      >
        <CalendarIcon className="w-3.5 h-3.5" /> Book Now
      </button>
  
      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
  
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
  
          {/* Modal Box */}
          <div className="relative z-10 w-full max-w-[440px] bg-primary border border-border flex flex-col max-h-[90vh]">
  
            {/* Grain overlay */}
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />
  
            {/* Corner accents */}
            <div className="pointer-events-none absolute top-0 left-0 w-10 h-10 border-t border-l border-gold opacity-50 z-10" />
            <div className="pointer-events-none absolute top-0 right-0 w-10 h-10 border-t border-r border-gold opacity-50 z-10" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-10 h-10 border-b border-l border-gold opacity-50 z-10" />
            <div className="pointer-events-none absolute bottom-0 right-0 w-10 h-10 border-b border-r border-gold opacity-50 z-10" />
  
            {/* Header */}
            <div className="relative z-10 px-6 pt-6 pb-5 border-b border-border">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-px w-6 bg-gold" />
                <span className="text-[9px] uppercase tracking-[0.28em] text-gold">Booking</span>
              </div>
              <h2
                className="text-2xl font-light text-text"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Artist Selection
              </h2>
              <p className="text-[11px] text-text-muted mt-1 tracking-wide">
                Select an artist before booking
              </p>
            </div>
  
            {/* Body */}
            <div className="relative z-10 px-6 py-5 overflow-auto flex-1 space-y-4">
  
              {/* Business — artist list */}
              {type === "bussiness" && (
                <div className="space-y-2 max-h-[280px] overflow-auto pr-1">
                  {bussinessInfoData?.artists.map((artist, index) => (
                    <div
                      key={artist.artist._id}
                      onClick={() => setArtistIndex(index)}
                      className={`relative flex items-center gap-4 px-4 py-3 border cursor-pointer transition-all duration-300 group ${
                        artistIndex === index
                          ? "border-gold bg-surface-alt"
                          : "border-border hover:border-border-gold bg-surface"
                      }`}
                    >
                      {/* Gold bottom line */}
                      <div className={`absolute bottom-0 left-0 h-[1px] bg-gold transition-all duration-500 ${
                        artistIndex === index ? "w-full" : "w-0 group-hover:w-full"
                      }`} />
  
                      <img
                        src={artist.artist.profile}
                        alt=""
                        className="w-11 h-11 object-cover border border-border flex-shrink-0"
                      />
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.18em] text-gold mb-0.5">Artist</p>
                        <p
                          className="text-base font-light text-text"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {artist.artist.name}
                        </p>
                      </div>
  
                      {/* Selected indicator */}
                      {artistIndex === index && (
                        <div className="ml-auto w-1.5 h-1.5 bg-gold flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
  
              {/* Single artist */}
              {type === "artist" && (
                <div className="relative flex items-center gap-4 px-4 py-3 border border-gold bg-surface-alt">
                  <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gold" />
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gold" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gold" />
                  <img
                    src={post.account.profile}
                    alt=""
                    className="w-11 h-11 object-cover border border-border flex-shrink-0"
                  />
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-gold mb-0.5">Artist</p>
                    <p
                      className="text-base font-light text-text"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {post.account.name}
                    </p>
                  </div>
                  <div className="ml-auto w-1.5 h-1.5 bg-gold flex-shrink-0" />
                </div>
              )}
  
              {/* Tattoo 3D Modal */}
              <SetTattoo3DModal
                key={post._id}
                tattooData={tattooData}
                setTatooData={setTatooData}
                img={post.postImg}
                fixSize={post.size}
              />
            </div>
  
            {/* Footer */}
            {validation() && (
              <div className="relative z-10 px-6 py-4 border-t border-border">
                <ArtistBookModal
                  tattooData={tattooData!}
                  times={getTimes()}
                  days={getDays()}
                  key={getKey()}
                  post={post}
                  artistId={getArtistId()}
                  bussinessId={getBussinessId()}
                />
              </div>
            )}
  
          </div>
        </div>
      )}
    </>
  )
}
