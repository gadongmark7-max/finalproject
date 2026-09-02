'use client';
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import { mapIcon } from "@/app/utils/customFunction";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/app/utils/axios";
import useCurrentLocation from "@/app/hooks/locationHooks";
import useUserStore from "@/app/store/useUserStore";
import LoadingScreen from "@/components/ui/loadingScreen";

const App: React.FC = () => {
  const { user } = useUserStore();
  const currentLocation = useCurrentLocation();

  const { data: bussinessInfo } = useQuery({
    queryKey: ['map_info_bussiness'],
    queryFn: async (): Promise<bussinessInfoInterface[]> => {
      const response = await axiosInstance.get(`/account/bussinessInfo`);
      return response.data.filter((item: bussinessInfoInterface) => item.isLookingArtist);
    }
  });

  if (!currentLocation || !user) return <LoadingScreen />;

  return (
    <div className="flex h-screen w-full bg-primary text-text">
  {/* Sidebar */}
  <div className="w-80 bg-secondary p-4 overflow-y-auto border-r border-border">
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
  <div className="flex-1">
    <MapContainer
      center={[currentLocation?.lat, currentLocation?.lng]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Current Location */}
      <Marker
        position={[currentLocation.lat, currentLocation.lng]}
        icon={mapIcon(user?.profile)}
      >
        <Popup>
          <h1>Your Current Location</h1>
        </Popup>
      </Marker>

      {/* Bussiness Markers */}
      {bussinessInfo?.map((b) => {
        if (!b.bussiness.location) return null;
        return (
          <Marker
            key={b._id}
            position={[b.bussiness.location.lat!, b.bussiness.location.long!]}
            icon={mapIcon("/shop-logo.jpg")}
          >
            <Popup>
              <div className="p-3 flex flex-col gap-3 max-w-[640px] text-left rounded">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/pages/artist/bussinessProfile/${b.bussiness._id}`}
                    className="w-10 h-10"
                  >
                    <img
                      src={b.bussiness.profile}
                      alt={b.bussiness.name}
                      className="w-10 h-10 rounded-full object-cover border border-border"
                    />
                  </Link>
                  <h1 className="text-sm font-semibold ">
                    {b.bussiness.name}
                  </h1>
                </div>

                {b.isLookingArtist && b.jobDescription && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-green-600 font-semibold">
                      Hiring
                    </span>
                    <pre className="text-xs text-text-muted whitespace-pre-wrap leading-relaxed">
                      {b.jobDescription}
                    </pre>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  </div>
</div>
  );
};

export default App;