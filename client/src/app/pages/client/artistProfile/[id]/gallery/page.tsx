"use client";
import { Suspense, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { artistInfoInterface } from "@/app/types/accounts.type";
import { Gallery } from "@/components/ui/gallery";
import { BackButton } from "@/components/ui/back-button";

const TABS = [
  { key: "all", label: "All" },
  { key: "studio", label: "Studio" },
  { key: "achievement", label: "Achievement" },
  { key: "client", label: "Clients" },
];

function GalleryContent() {
  const params = useParams();
  const artistId = params.id as string;
  const searchParams = useSearchParams();

  const requested = searchParams.get("type");
  const [tab, setTab] = useState(
    TABS.some((t) => t.key === requested) ? (requested as string) : "all",
  );

  const { data: artistInfo, isLoading } = useQuery({
    queryKey: ["artist_gallery_client", artistId],
    queryFn: async (): Promise<artistInfoInterface> =>
      (await axiosInstance.get(`/account/artistInfo/${artistId}`)).data,
  });

  if (isLoading || !artistInfo)
    return (
      <div className="min-h-dvh bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border border-gold-dim border-t-gold animate-spin" />
          <p className="text-text-muted text-[10px] uppercase tracking-[0.28em]">
            Loading Gallery
          </p>
        </div>
      </div>
    );

  const files = artistInfo.profileImages.filter(
    (item) => tab === "all" || item.type === tab,
  );

  return (
    <div className="w-full min-h-dvh bg-primary">
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] lg:w-[800px] h-[300px] lg:h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <BackButton className="mb-6" />

        <div className="border-b border-border pb-8 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
              Portfolio
            </span>
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-light text-text tracking-[-0.02em] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {artistInfo.artist.name}
          </h1>
        </div>

        <div className="flex gap-0 border-b border-border w-full sm:w-auto sm:inline-flex mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 sm:px-5 py-2.5 text-[10px] uppercase tracking-[0.18em] transition-all duration-300 border-b-[1px] -mb-px whitespace-nowrap flex-1 sm:flex-none ${
                tab === t.key
                  ? "text-gold border-gold bg-surface"
                  : "text-text-muted border-transparent hover:text-text hover:border-border-gold"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Gallery
          key={tab}
          files={files}
          layout="grid"
          gridClassName="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GalleryContent />
    </Suspense>
  );
}
