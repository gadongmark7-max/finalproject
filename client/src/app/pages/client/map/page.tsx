"use client";
import React, { useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import {
  accountInterface,
  artistInfoInterface,
} from "@/app/types/accounts.type";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import axiosInstance from "@/app/utils/axios";
import {
  LocationError,
  LOCATION_ERROR_MESSAGES,
  useCurrentLocationState,
} from "@/app/hooks/locationHooks";
import type { RouteStatus } from "./components/routingMap";
import {
  formatRouteDistance,
  formatRouteDuration,
} from "@/app/utils/routing";
import useUserStore from "@/app/store/useUserStore";
import { ProfileOverview } from "./components/profileOverview";
import { useState } from "react";
import {
  AlertTriangle,
  LoaderCircle,
  MapPin,
  Navigation,
  RotateCcw,
  Star,
  User,
  Users,
  X,
} from "lucide-react";
import { ProfileDisplay } from "./components/profileDisplay";
import { isNear, getDistance } from "@/app/utils/customFunction";
import LoadingScreen from "@/components/ui/loadingScreen";

const ClientMapView = dynamic(() => import("./components/mapLibreView"), {
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

  const [route, setRoute] = useState<{
    id: number;
    from: { lat: number; lng: number };
    to: { lat: number; lng: number };
  } | null>(null);
  const [routeDestination, setRouteDestination] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [routeStatus, setRouteStatus] = useState<RouteStatus | null>(null);
  const routeRequestRef = useRef(0);

  const showRoute = useCallback(
    async (destination: { lat: number; lng: number; name: string }) => {
      const requestId = ++routeRequestRef.current;
      setRoute(null);
      setRouteDestination(destination);
      setRouteStatus({ state: "loading" });
      try {
        const from = await refreshLocation();
        if (requestId !== routeRequestRef.current) return;
        setRoute({
          id: requestId,
          from,
          to: { lat: destination.lat, lng: destination.lng },
        });
      } catch (e) {
        if (requestId !== routeRequestRef.current) return;
        setRouteStatus({
          state: "error",
          message:
            e instanceof LocationError
              ? e.message
              : LOCATION_ERROR_MESSAGES.unavailable,
        });
      }
    },
    [refreshLocation],
  );

  const handleRouteStatus = useCallback((status: RouteStatus) => {
    setRouteStatus(status);
  }, []);

  const clearRoute = () => {
    routeRequestRef.current++;
    setRoute(null);
    setRouteDestination(null);
    setRouteStatus(null);
  };

  const [openModal, setOpenModal] = useState(false);

  const [showNearby, setShowNearby] = useState(false);

  const [account, setAcount] = useState<accountInterface | null>(null);
  const [userProfile, setUserProfile] = useState<
    bussinessInfoInterface | artistInfoInterface | null
  >(null);

  const [nearestUsers, setNearestUsers] = useState<
    {
      userProfile: bussinessInfoInterface | artistInfoInterface;
      account: accountInterface;
      distance: number;
    }[]
  >([]);

  const { data: artistInfo } = useQuery({
    queryKey: ["map_info_artist"],
    queryFn: async (): Promise<artistInfoInterface[]> => {
      const response = await axiosInstance.get(`/account/artistInfo`);
      return response.data;
    },
  });

  const { data: bussinessInfo } = useQuery({
    queryKey: ["map_info_bussiness"],
    queryFn: async (): Promise<bussinessInfoInterface[]> => {
      const response = await axiosInstance.get(`/account/bussinessInfo`);
      return response.data;
    },
  });

  useEffect(() => {
    if (bussinessInfo && artistInfo && currentLocation) {
      const radius = 5;

      const allNearestUsers: {
        userProfile: bussinessInfoInterface | artistInfoInterface;
        account: accountInterface;
        distance: number;
      }[] = [];

      artistInfo.forEach((artist) => {
        if (!artist.artist?.location) return null;

        if (
          artist.artist.location?.lat != null &&
          artist.artist.location?.long != null
        ) {
          const targetLocation = {
            lat: artist.artist.location.lat,
            lng: artist.artist.location.long,
          };

          if (isNear(currentLocation, targetLocation, radius)) {
            allNearestUsers.push({
              userProfile: artist,
              account: artist.artist,
              distance: getDistance(currentLocation, targetLocation),
            });
          }
        }
      });

      bussinessInfo.forEach((bussiness) => {
        if (!bussiness.bussiness?.location) return null;

        if (
          bussiness.bussiness.location?.lat != null &&
          bussiness.bussiness.location?.long != null
        ) {
          const targetLocation = {
            lat: bussiness.bussiness.location.lat,
            lng: bussiness.bussiness.location.long,
          };

          if (isNear(currentLocation, targetLocation, radius)) {
            allNearestUsers.push({
              userProfile: bussiness,
              account: bussiness.bussiness,
              distance: getDistance(currentLocation, targetLocation),
            });
          }
        }
      });

      setNearestUsers(allNearestUsers);
    }
  }, [currentLocation, artistInfo, bussinessInfo]);

  if (!currentLocation && locationError) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-primary px-4">
        <div className="max-w-md w-full bg-secondary border border-border p-6 space-y-4 text-center">
          <AlertTriangle className="w-6 h-6 text-gold mx-auto" />
          <p className="text-sm text-text">
            {LOCATION_ERROR_MESSAGES[locationError]}
          </p>
          <button
            onClick={() => refreshLocation().catch(() => {})}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border-gold text-gold text-xs uppercase tracking-[0.18em] hover:bg-gold/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Try again
          </button>
        </div>
      </div>
    );
  }

  if (!currentLocation || !user) return <LoadingScreen />;

  const selectProfile = (
    userProfile: artistInfoInterface | bussinessInfoInterface,
    account: accountInterface,
  ) => {
    setAcount(account);
    setUserProfile(userProfile);
    setOpenModal(true);
    setShowNearby(false);
  };

  return (
    <div className="h-dvh w-full relative">
      <div className="absolute top-6 left-15 z-[1100]">
        <button
          onClick={() => setShowNearby((prev) => !prev)}
          className="bg-secondary flex items-center gap-2 rounded-full text-gold  px-4 py-2 shadow-lg border hover:scale-95"
        >
          <Users className="w-4 h-4 text-black-500" />
          <span className="text-sm font-medium">
            Nearby ({" "}
            <span className=" font-bold text-gold">
              {" "}
              {nearestUsers.length}{" "}
            </span>
            )
          </span>
        </button>

        {showNearby && (
          <div className="  overflow-y-auto rounded-xl bg-white shadow-xl border mt-2">
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center gap-2 bg-primary">
              <MapPin className="w-5 h-5 text-black-500" />
              <h2 className="text-sm font-semibold text-gold">Nearest Users</h2>
              <span className="ml-auto text-xs text-gray-500">
                {nearestUsers.length} found
              </span>
            </div>

            {/* List */}
            <div className="divide-y bg-secondary">
              {nearestUsers.map((item) => (
                <ProfileDisplay
                  key={item.account._id}
                  userProfile={item.userProfile}
                  account={item.account}
                  distance={item.distance}
                  callback={() => selectProfile(item.userProfile, item.account)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {account && userProfile && (
        <ProfileOverview
          key={userProfile._id}
          onShowRoute={showRoute}
          userProfile={userProfile}
          account={account}
          setOpen={setOpenModal}
          open={openModal}
        />
      )}

      <ClientMapView
        currentLocation={currentLocation}
        userProfile={user.profile}
        artistInfo={artistInfo}
        bussinessInfo={bussinessInfo}
        route={route}
        onRouteStatusChange={handleRouteStatus}
        onSelectProfile={selectProfile}
      />
      {routeStatus && routeDestination && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1100] w-[calc(100%-2rem)] max-w-md bg-secondary border border-border shadow-lg p-4"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="bg-surface-alt border border-border p-2 shrink-0">
              {routeStatus.state === "loading" ? (
                <LoaderCircle className="w-4 h-4 text-gold animate-spin" />
              ) : routeStatus.state === "error" ? (
                <AlertTriangle className="w-4 h-4 text-danger-light" />
              ) : (
                <Navigation className="w-4 h-4 text-gold" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                Route to
              </p>
              <p className="text-sm text-text truncate">
                {routeDestination.name}
              </p>
              {routeStatus.state === "loading" && (
                <p className="text-xs text-text-muted mt-1">
                  Getting your location and calculating the route…
                </p>
              )}
              {routeStatus.state === "ready" && (
                <p className="text-sm text-text mt-1">
                  <span className="text-gold">
                    {formatRouteDistance(routeStatus.distanceMeters)}
                  </span>
                  <span className="text-text-muted"> · about </span>
                  {formatRouteDuration(routeStatus.durationSeconds)}
                  <span className="text-text-muted"> by car</span>
                </p>
              )}
              {routeStatus.state === "error" && (
                <div className="mt-1 space-y-2">
                  <p className="text-xs text-danger-light">
                    {routeStatus.message}
                  </p>
                  <button
                    onClick={() => showRoute(routeDestination)}
                    className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline"
                  >
                    <RotateCcw className="w-3 h-3" /> Try again
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={clearRoute}
              aria-label="Clear route"
              className="p-1 text-text-muted hover:text-text transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
