"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Plus , ImageOff} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { postInterface } from "@/app/types/post.type";
import axiosInstance from "@/app/utils/axios";
import useUserStore from "@/app/store/useUserStore";
import SubscriptionExpired from "@/components/ui/subscriptionExpired"
import { checkIfSubsExpired , isNotVerified} from "@/app/utils/customFunction"
import { documentInterface } from "@/app/types/document.type";
import LoadingScreen from "@/components/ui/loadingScreen";
import NotVerified from "@/components/ui/notverified";

export default function Page() {

  const { user  } = useUserStore()
  
  const [posts, setPosts] = useState<postInterface[]>([])

  const { data } = useQuery({
    queryKey : ['my_post'],
    queryFn : () => axiosInstance.get(`/post/account/${user?._id}`)
  })

  useEffect(() => {
      if(data?.data) setPosts(data.data)
  },[data])

  const { data: documents } = useQuery({
          queryKey: ["documents"],
          queryFn: async (): Promise<documentInterface> => {
            const response = await axiosInstance.get(`/account/document/${user?._id}`);
            return response.data;
          },
  });
  
  if(!documents) return <LoadingScreen />
  
  if(isNotVerified(documents)) return <NotVerified />

  if(checkIfSubsExpired(user?.subscriptionExpiration!)) return <SubscriptionExpired />



  return (
    <div className="w-full min-h-dvh bg-primary overflow-auto">

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      {/* Page Header */}
      <div className="bg-secondary border-b border-border px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Artist Portfolio</span>
            </div>
            <h1
              className="text-4xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              My Posts
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Showcase your tattoo work and manage your portfolio pieces.
            </p>
          </div>

            <Link href={"/pages/bussiness/addPost/new"}>
              <Button size="lg">
                <Plus className="w-4 h-4" />
                Add Post
              </Button>
            </Link>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">

        {posts.length === 0 ? (
          <div className="border border-dashed border-border flex flex-col items-center justify-center py-28 gap-4 bg-surface">
            <div className="bg-surface-alt border border-border p-4">
              <ImageOff className="w-8 h-8 text-text-dim" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-text-muted">No posts yet</p>
              <p className="text-xs text-text-dim tracking-wide">Add your first post to start building your portfolio</p>
            </div>
          </div>
        ) : (
          <>
           {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/pages/bussiness/post/${post._id}`}
              className="group relative h-[500px] overflow-hidden border border-border hover:border-border-gold transition-all duration-500"
            >
              {/* Full Image */}
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <img
                  src={post.postImg}
                  alt="post"
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Dark gradient top */}
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-primary/70 to-transparent" />

              {/* Price Badge */}
              <div className="absolute top-4 right-4">
                <span className="bg-surface/90 border border-border-gold text-gold text-xs tracking-[0.1em] px-3 py-1">
                  ₱{post.price.toLocaleString()}
                </span>
              </div>

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="absolute top-4 left-4 flex flex-wrap gap-1 max-w-[60%]">
                    <span
                      className="text-[9px] uppercase tracking-[0.18em] text-gold bg-primary/80 border border-border px-2 py-0.5"
                    >
                      {post.category}
                    </span>
                </div>
              )}

              {/* Dark gradient bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-primary/90 to-transparent" />

              {/* Artist Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={post.account.profile}
                    alt="artist"
                    className="w-9 h-9 object-cover border border-border-gold flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-gold">
                      {post.account.type}
                    </p>
                    <h2 className="text-text text-sm font-light truncate" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {post.account.name}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Gold bottom line reveal */}
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/[0.03] transition-colors duration-500" />
            </Link>
          ))}
        </div>

     
          </>
        )}
      </div>
    </div>
  );
}
