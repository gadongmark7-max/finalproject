"use client"

import { useState, useEffect } from "react"
import { errorAlert } from "@/app/utils/alert"
import { useQuery, useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { useParams } from "next/navigation"
import { postInterface } from "@/app/types/post.type"
import Link from "next/link"
import { MessageCircle, Building, User, Layers } from "lucide-react"
import { ArtistSelectionModal } from "./components/artistSelectionModal"
import useUserStore from "@/app/store/useUserStore"
import { useRouter } from "next/navigation"
import { artistInfoInterface } from "@/app/types/accounts.type"

export default function Page() {
  const { user } = useUserStore()
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState<postInterface | null>(null)

  const { data } = useQuery({
    queryKey: ["view_post"],
    queryFn: () => axiosInstance.get(`/post/${postId}`),
  })

  const { data: artistInfo } = useQuery({
    queryKey: ["artistInfo"],
    queryFn: async (): Promise<artistInfoInterface> => {
      const response = await axiosInstance.get(`/account/artistInfo/${post?.account._id}`)
      return response.data
    },
    enabled: post?.account.type === "artist",
  })

  useEffect(() => {
    if (data?.data) setPost(data?.data)
  }, [data])

  const messageMutation = useMutation({
    mutationFn: () => axiosInstance.post(`/convo/convoId/${post?.account._id}`),
    onSuccess: (response) => router.push(`/pages/client/convo/${response.data}`),
    onError: () => errorAlert("error occured"),
  })

  if (!post) return (
    <div className="w-full h-dvh bg-primary flex items-center justify-center">
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />
      <p className="text-text-muted text-[10px] uppercase tracking-[0.28em]">Loading...</p>
    </div>
  )

  return (
    <div className="w-full min-h-dvh bg-primary overflow-auto">

      {/* Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient Gold Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT — Image + Book */}
          <div className="space-y-4">
            <div className="relative border border-border overflow-hidden h-[600px] bg-surface">
              {/* Corner accents */}
              <div className="pointer-events-none absolute top-0 left-0 w-10 h-10 border-t border-l border-gold opacity-50 z-10" />
              <div className="pointer-events-none absolute top-0 right-0 w-10 h-10 border-t border-r border-gold opacity-50 z-10" />
              <div className="pointer-events-none absolute bottom-0 left-0 w-10 h-10 border-b border-l border-gold opacity-50 z-10" />
              <div className="pointer-events-none absolute bottom-0 right-0 w-10 h-10 border-b border-r border-gold opacity-50 z-10" />
              <img
                src={post.postImg}
                alt="post"
                className="w-full h-full object-cover"
              />
            </div>

            {user?._id !== post.account._id && (
              <div className="relative bg-surface border border-border p-4">
                <ArtistSelectionModal post={post} type={post.account.type} />
              </div>
            )}
          </div>

          {/* RIGHT — Details */}
          <div className="space-y-5">

            {/* Artist / Business Info */}
            <div className="relative bg-surface border border-border group transition-all duration-500 hover:border-border-gold p-6">
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

              <p className="text-[9px] uppercase tracking-[0.28em] text-gold mb-4">
                {post.account.type} Information
              </p>

              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={post.account.profile}
                    alt="profile"
                    className="w-14 h-14 object-cover border border-border"
                  />
                  <div className="absolute -bottom-px -right-px w-2.5 h-2.5 bg-gold opacity-60" />
                </div>
                <div>
                  <p
                    className="text-xl font-light text-text"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {post.account.name}
                  </p>
                  <p className="text-[11px] text-text-muted tracking-wide mt-0.5">
                    {post.account.contact}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                {post.account.type === "artist" ? (
                  <Link href={`/pages/client/artistProfile/${post.account._id}`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] px-4 py-3 border border-gold text-gold hover:bg-gold hover:text-primary transition-all duration-200">
                      <User className="w-3.5 h-3.5" /> View Artist
                    </button>
                  </Link>
                ) : (
                  <Link href={`/pages/client/bussinessProfile/${post.account._id}`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] px-4 py-3 border border-gold text-gold hover:bg-gold hover:text-primary transition-all duration-200">
                      <Building className="w-3.5 h-3.5" /> View Business
                    </button>
                  </Link>
                )}

                {user?._id !== post.account._id && (
                  <button
                    onClick={() => messageMutation.mutate()}
                    disabled={messageMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] px-4 py-3 border border-border text-text-muted hover:border-border-gold hover:text-text transition-all duration-200 disabled:opacity-40"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Message
                  </button>
                )}
              </div>
            </div>

            {/* Pricing & Category */}
            <div className="bg-surface border border-border">
              <div className="grid grid-cols-3 gap-px bg-border">
                <div className="bg-surface px-5 py-5">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gold mb-1">Price</p>
                  <p
                    className="text-2xl font-light text-text"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    ₱{post.price.toLocaleString()}
                  </p>
                </div>
                <div className="bg-surface px-5 py-5">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gold mb-1">Down Payment</p>
                  <p
                    className="text-2xl font-light text-text"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {post.downPercentage}%
                  </p>
                </div>
                <div className="bg-surface px-5 py-5">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gold mb-1">Category</p>
                  <p
                    className="text-lg font-light text-text"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {post.category}
                  </p>
                </div>
              </div>
            </div>

            {/* Sessions */}
            {post.sessions.length > 0 && (
              <div className="relative bg-surface border border-border group transition-all duration-500 hover:border-border-gold p-6">
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

                <div className="flex items-center justify-between mb-4">
                  <p className="text-[9px] uppercase tracking-[0.28em] text-gold flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Sessions
                  </p>
                  <span className="text-[9px] uppercase tracking-[0.15em] px-2.5 py-1 border border-gold text-gold">
                    {post.sessions.length} {post.sessions.length > 1 ? "sessions" : "session"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {post.sessions.map((session, index) => (
                    <div
                      key={index}
                      className="relative border border-border bg-primary px-4 py-4 group/session hover:border-border-gold transition-all duration-300"
                    >
                      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover/session:w-full transition-all duration-500" />
                      <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted mb-1">
                        Session {index + 1}
                      </p>
                      <p
                        className="text-xl font-light text-text"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {session} {session !== 1 ? "hrs" : "hr"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="relative bg-surface border border-border group transition-all duration-500 hover:border-border-gold p-6">
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
                <p className="text-[9px] uppercase tracking-[0.28em] text-gold mb-4">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-[9px] uppercase tracking-[0.15em] px-3 py-1.5 border border-border text-text-muted hover:border-border-gold hover:text-text transition-all duration-200 cursor-default"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}