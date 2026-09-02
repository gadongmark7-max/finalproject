"use client";
import useUserStore from "@/app/store/useUserStore";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { artistInfoInterface } from "@/app/types/accounts.type";
import { postInterface } from "@/app/types/post.type";
import ImgCard from "./components/imgCard";
import Link from "next/link";
import MapLocation from "./components/location";
import { useParams } from "next/navigation";
import { ArtistCalendar } from "./components/artistCalendar";
import ReviewsComponent from "./components/reviews";
import { Button } from "@/components/ui/button";
import { MessageCircle, Skull, MapPin, Star, ChevronRight, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { errorAlert } from "@/app/utils/alert";
import { StarReviews } from "@/components/ui/starRating";

export default function Page() {

  const params = useParams();
  const artistId = params.id as string;
  const { user } = useUserStore();
  const router = useRouter();

  const [artistInfo, setArtistInfo] = useState<artistInfoInterface | null>(null);
  const [posts, setPosts] = useState<postInterface[]>([]);
  const [imgType, setImgType] = useState("studio");

  const { data: artistInfoData } = useQuery({
    queryKey: ["artist_profile_client"],
    queryFn: () => axiosInstance.get(`/account/artistInfo/${artistId}`),
  });

  const { data: postsData } = useQuery({
    queryKey: ["artist_post_client"],
    queryFn: () => axiosInstance.get(`/post/account/${artistId}`),
  });

  useEffect(() => {
    if (artistInfoData?.data) setArtistInfo(artistInfoData?.data);
    if (postsData?.data) setPosts(postsData.data);
  }, [artistInfoData, postsData]);

  const messageMutation = useMutation({
    mutationFn: () => axiosInstance.post(`/convo/convoId/${artistInfo?.artist._id}`),
    onSuccess: (response) => {
      router.push(`/pages/client/convo/${response.data}`);
    },
    onError: () => errorAlert("error accour"),
  });

  if (!artistInfo)
    return (
      <div className="min-h-dvh bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border border-gold-dim border-t-gold animate-spin" />
          <p className="text-text-muted text-[10px] uppercase tracking-[0.28em]">Loading Atelier</p>
        </div>
      </div>
    );

  const galleryTabs = [
    { key: "studio", label: "Studio", icon: <Layers size={12} /> },
    { key: "achievement", label: "Achievement", icon: <Star size={12} /> },
    { key: "client", label: "Clients", icon: <ChevronRight size={12} /> },
  ];

  return (
    <div className="w-full min-h-dvh bg-primary">

      {/* Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] lg:w-[800px] h-[300px] lg:h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">

        {/* ── HERO PROFILE ── */}
        <div className="border-b border-border pb-10 mb-10">

          {/* Top: Avatar + Info + Gallery — stacked on mobile, side-by-side on lg */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12">

            {/* LEFT — Avatar + Info + Buttons */}
            <div className="flex flex-col gap-6">

              {/* Avatar + Name row */}
              <div className="flex flex-row gap-6 items-start">

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-[3px] border border-gold opacity-30" />
                  <img
                    src={artistInfo.artist.profile}
                    alt="artist profile"
                    className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 object-cover cursor-pointer hover:opacity-80 transition-opacity duration-300"
                  />
                  <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-gold" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-gold" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-gold" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-gold" />
                </div>

                {/* Name + Eyebrow */}
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-6 sm:w-8 bg-gold flex-shrink-0" />
                    <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Ink Artist</span>
                  </div>
                  <h1
                    className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-text tracking-[-0.02em] leading-tight"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {artistInfo.artist.name}
                  </h1>
                  <StarReviews userProfile={artistInfo} />
                </div>
              </div>

              {/* Bio */}
              <p className="text-text-muted text-sm leading-relaxed">
                {artistInfo.bio || "No biography available. This artist's work speaks for itself."}
              </p>

              {/* Action Buttons */}
              {user?._id !== artistInfo.artist._id && (
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => messageMutation.mutate()}>
                    <MessageCircle size={14} />
                    Message Artist
                  </Button>
                  <Button variant="outline">
                    <Skull size={14} />
                    Report
                  </Button>
                </div>
              )}
            </div>

            {/* RIGHT — Portfolio Gallery */}
            <div className="flex flex-col gap-0">

              {/* Eyebrow + Tabs row */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mb-4">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="h-px w-8 bg-gold" />
                  <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Portfolio</span>
                  <div className="h-px w-8 bg-gold" />
                </div>

                {/* Tabs */}
                <div className="flex gap-0 border-b border-border w-full sm:w-auto">
                  {galleryTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setImgType(tab.key)}
                      className={`flex items-center gap-1.5 px-3 sm:px-5 py-2.5 text-[10px] uppercase tracking-[0.18em] transition-all duration-300 border-b-[1px] -mb-px flex-1 sm:flex-none justify-center sm:justify-start ${
                        imgType === tab.key
                          ? "text-gold border-gold bg-surface"
                          : "text-text-muted border-transparent hover:text-text hover:border-border-gold"
                      }`}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gallery Images */}
              <div className="mt-2">
                {imgType === "studio" && (
                  <ImgCard type="studio" addImg={true} images={artistInfo.profileImages.filter((item) => item.type === "studio").map((item) => item.fileUrl)} />
                )}
                {imgType === "achievement" && (
                  <ImgCard type="achievement" addImg={true} images={artistInfo.profileImages.filter((item) => item.type === "achievement").map((item) => item.fileUrl)} />
                )}
                {imgType === "client" && (
                  <ImgCard type="client" addImg={true} images={artistInfo.profileImages.filter((item) => item.type === "client").map((item) => item.fileUrl)} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── CALENDAR ── */}
        <div className="mb-12 border-b border-border pb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Availability</span>
          </div>
          <ArtistCalendar artistId={artistInfo.artist?._id} times={artistInfo.schedTime} days={artistInfo.schedDay} />
        </div>

        {/* ── REVIEWS + MAP ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 border-b border-border pb-12">

          {/* Reviews */}
          <div className="relative group bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden">
            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-7 h-7 bg-surface-alt border border-border flex items-center justify-center flex-shrink-0">
                  <Star size={12} className="text-gold" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Client Reviews</span>
              </div>
              <div className="h-[240px] sm:h-[260px] overflow-y-auto">
                <ReviewsComponent artistInfo={artistInfo} />
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="relative group bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden">
            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-7 h-7 bg-surface-alt border border-border flex items-center justify-center flex-shrink-0">
                  <MapPin size={12} className="text-gold" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Studio Location</span>
              </div>
              <div className="h-[240px] sm:h-[260px] overflow-hidden">
                <MapLocation artistInfo={artistInfo} setArtistInfo={setArtistInfo} />
              </div>
            </div>
          </div>
        </div>

        {/* ── POSTS GRID ── */}
        {posts.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8 sm:mb-10">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Published Works</span>
              <div className="h-px flex-1 bg-border max-w-[60px] sm:max-w-[80px]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {posts.map((post, index) => (
                <div
                  key={post._id}
                  className="group relative bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden"
                >
                  {/* Ghost Number */}
                  <span
                    className="absolute top-3 right-3 text-5xl font-light text-text-dim leading-none z-10 select-none pointer-events-none"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Gold bottom reveal */}
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700 z-10" />

                  {/* Post Image */}
                  <div className="relative h-60 sm:h-72 overflow-hidden">
                    <img
                      src={post.postImg}
                      alt="post"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-0 transition-opacity duration-500" />

                    {/* Price Badge */}
                    <span className="absolute bottom-3 left-3 bg-primary border border-gold-dim text-gold text-[10px] px-3 py-1 uppercase tracking-[0.2em]">
                      ₱{post.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={post.account.profile}
                          alt="artist"
                          className="w-9 h-9 object-cover border border-border"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted truncate">
                          {post.account.type}
                        </p>
                        <h3
                          className="text-sm font-light text-text tracking-wide truncate"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {post.account.name}
                        </h3>
                      </div>
                    </div>

                    <Link href={`/pages/client/post/${post._id}`}>
                      <Button className="w-full">
                        View Post
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Rule */}
        <div className="mt-16 sm:mt-20 pt-8 border-t border-border flex items-center justify-between gap-4">
          <span className="text-[10px] uppercase tracking-widest text-text-dim whitespace-nowrap">Ink Of Baphomet Atelier</span>
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-widest text-text-dim whitespace-nowrap">Est. Portfolio</span>
        </div>

      </div>
    </div>
  );
}