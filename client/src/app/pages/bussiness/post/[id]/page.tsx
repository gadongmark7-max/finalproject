"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { useParams, useRouter } from "next/navigation"
import { postInterface } from "@/app/types/post.type"
import Link from "next/link"
import { Box, Trash, Layers } from "lucide-react"
import { confirmAlert, errorAlert } from "@/app/utils/alert"
import Swal from "sweetalert2"
import { EditPostmodal } from "./components/editPostModal"
import useUserStore from "@/app/store/useUserStore"
import SubscriptionExpired from "@/components/ui/subscriptionExpired"
import { checkIfSubsExpired } from "@/app/utils/customFunction"

export default function Page() {
  const params = useParams()
  const postId = params.id as string
  const router = useRouter()
  const { user } = useUserStore()

  const [post, setPost] = useState<postInterface | null>(null)

  const { data } = useQuery({
    queryKey: ["view_post"],
    queryFn: () => axiosInstance.get(`/post/${postId}`),
  })

  useEffect(() => {
    if (data?.data) setPost(data?.data)
  }, [data])

  const deleteMutation = useMutation({
    mutationFn: () => axiosInstance.delete(`/post/${post?._id}`),
    onSuccess: () => {
      Swal.fire({
        title: "Post Deleted",
        text: "You will be redirected to your posts.",
        icon: "success",
      }).then(() => router.push("/pages/bussiness/myPost"))
    },
    onError: () => errorAlert("error occured"),
  })

  const handleDelete = () => {
    confirmAlert("you want to delete this post?", "delete", () => deleteMutation.mutate())
  }

  if (checkIfSubsExpired(user?.subscriptionExpiration!)) return <SubscriptionExpired />

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

          {/* LEFT — Image + 3D */}
          <div className="space-y-4">

            {/* Image */}
            <div className="relative border border-border overflow-hidden h-[560px] bg-surface">
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

            {/* 3D Preview */}
            <Link href={{ pathname: "/3d", query: { img: post.postImg } }}>
              <div className="relative bg-surface border border-border group transition-all duration-500 hover:border-border-gold flex items-center gap-3 px-5 py-4 cursor-pointer">
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
                <Box className="w-4 h-4 text-gold flex-shrink-0" />
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gold">Preview</p>
                  <p className="text-text text-sm font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    View in 3D
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* RIGHT — Details */}
          <div className="space-y-5">

            {/* Manage Post */}
            <div className="relative bg-surface border border-border group transition-all duration-500 hover:border-border-gold p-6">
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-6 bg-gold" />
                <span className="text-[9px] uppercase tracking-[0.28em] text-gold">Actions</span>
              </div>
              <h2
                className="text-2xl font-light text-text mb-5"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Manage Post
              </h2>
              <div className="flex gap-3">
                <EditPostmodal post={post} setPost={setPost} />
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] px-5 py-3 border border-border text-text-muted hover:border-red-500 hover:text-red-400 transition-all duration-200 disabled:opacity-40"
                >
                  <Trash className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>

            {/* Pricing & Category */}
            <div className="bg-surface border border-border">
              <div className="grid grid-cols-2 gap-px bg-border">
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
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gold mb-1">Category</p>
                  <p
                    className="text-2xl font-light text-text"
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
                      <p className="text-[9px] text-text-muted mt-1 uppercase tracking-[0.12em]">
                        Estimated time
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