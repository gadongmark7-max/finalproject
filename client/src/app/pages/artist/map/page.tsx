'use client';
import React from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, LoaderCircle, RotateCcw } from "lucide-react";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import Link from "next/link";
import axiosInstance from "@/app/utils/axios";
import {
  LOCATION_ERROR_MESSAGES,
  useCurrentLocationState,
} from "@/app/hooks/locationHooks";
import useUserStore from "@/app/store/useUserStore";
import LoadingScreen from "@/components/ui/loadingScreen";
import { isValidCoordinate } from "@/app/utils/routing";

const ArtistMapView = dynamic(() => import("./components/mapLibreView"), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

const App: React.FC = () => {
  const { user } = useUserStore();
  const {
    location: currentLocation,
    error: locationError,
    refresh: refreshLocation,
  } = useCurrentLocationState();

  const { data: bussinessInfo } = useQuery({
    queryKey: ['map_info_bussiness'],
    queryFn: async (): Promise<bussinessInfoInterface[]> => {
      const response = await axiosInstance.get(`/account/bussinessInfo`);
      return response.data.filter((item: bussinessInfoInterface) => item.isLookingArtist);
    }
  });

  const { data: artistProfileData, isPending: studioPending } = useQuery({
    queryKey: ["artist_profile"],
    queryFn: () => axiosInstance.get(`/account/artistInfo/${user?._id}`),
    enabled: !!user?._id,
  });

  if (!user) return <LoadingScreen />;

  const artistAccount = artistProfileData?.data?.artist ?? user;
  const studioLocation = isValidCoordinate(
    artistAccount.location?.lat,
    artistAccount.location?.long,
  )
    ? { lat: artistAccount.location!.lat!, lng: artistAccount.location!.long! }
    : null;

  const notice = !currentLocation
    ? locationError
      ? {
          tone: "error" as const,
          text:
            locationError === "denied"
              ? "Location permission was denied, so your current location can't be shown. Allow location access in your browser settings to see it on the map."
              : LOCATION_ERROR_MESSAGES[locationError],
        }
      : { tone: "loading" as const, text: "Finding your current location…" }
    : null;

  return (
    <div className="flex flex-col md:flex-row h-dvh w-full bg-primary text-text">
  {/* Sidebar */}
  <div className="w-full md:w-80 max-h-[38dvh] md:max-h-none shrink-0 bg-secondary p-4 overflow-y-auto border-b md:border-b-0 md:border-r border-border">
    <h2 className="text-lg font-semibold mb-4 text-gold">Job Posts</h2>

    {bussinessInfo?.length === 0 ? (
      <p className="text-text-muted">No job posts available</p>
    ) : (
      <div className="flex flex-col gap-4">
        {bussinessInfo?.map((b) => (
          <div
            key={b._id}
            className="border border-border rounded-lg p-3 bg-surface"
          >
            <div className="flex items-center gap-2 mb-2">
              <img
                src={b.bussiness.profile}
                alt={b.bussiness.name}
                className="w-10 h-10 rounded-full object-cover border border-border"
              />
              <h3 className="text-sm font-semibold text-text">
                {b.bussiness.name}
              </h3>
            </div>

            {/* ✅ Job Description: preserve spaces and hyphens */}
            {b.jobDescription && (
              <pre className="text-xs text-text-muted whitespace-pre-wrap leading-relaxed">
                {b.jobDescription}
              </pre>
            )}

            <Link
              href={`/pages/artist/bussinessProfile/${b.bussiness._id}`}
              className="text-xs text-gold-light underline mt-2 inline-block"
            >
              View Profile
            </Link>
          </div>
        ))}
      </div>
    )}
  </div>

  {/* Map */}
  <div className="relative flex-1 min-h-[320px]">
    <ArtistMapView
      currentLocation={currentLocation}
      studioLocation={studioLocation}
      userProfile={artistAccount.profile}
      bussinessInfo={bussinessInfo}
    />

    {(notice || (!studioPending && !studioLocation)) && (
      <div
        className="absolute top-4 left-4 right-14 sm:right-auto sm:max-w-sm z-10 flex flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {notice && (
          <div className="flex items-start gap-3 bg-secondary border border-border shadow-lg px-4 py-3">
            {notice.tone === "loading" ? (
              <LoaderCircle className="w-4 h-4 text-gold animate-spin shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-xs text-text">{notice.text}</p>
              {notice.tone === "error" && (
                <button
                  onClick={() => refreshLocation().catch(() => {})}
                  className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline"
                >
                  <RotateCcw className="w-3 h-3" /> Try again
                </button>
              )}
            </div>
          </div>
        )}
        {!studioPending && !studioLocation && (
          <div className="flex items-start gap-3 bg-secondary border border-border shadow-lg px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <p className="text-xs text-text">
              Your studio location isn&apos;t set yet.{" "}
              <Link
                href="/pages/artist/profile"
                className="text-gold hover:underline"
              >
                Set it on your profile
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    )}
  </div>
</div>
  );
};

export default App;
