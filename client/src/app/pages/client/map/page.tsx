'use client';
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
import { accountInterface, artistInfoInterface } from "@/app/types/accounts.type";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import { mapIcon } from "@/app/utils/customFunction";
import axiosInstance from "@/app/utils/axios";
import useCurrentLocation from "@/app/hooks/locationHooks";
import useUserStore from "@/app/store/useUserStore";
import { ProfileOverview } from "./components/profileOverview";
import { useState } from "react";
import RoutingControl from "./components/routingMap";
import { MapPin, Star, User , Users, X} from "lucide-react"
import { ProfileDisplay } from "./components/profileDisplay";
import { isNear, getDistance } from "@/app/utils/customFunction";
import LoadingScreen from "@/components/ui/loadingScreen";

const App: React.FC = () => {
 

  const {user} = useUserStore()

  const currentLocation = useCurrentLocation()



  const [pointB, setPointB] = useState<{lat : number, lng :number} | null>(null)



 
  const [openModal, setOpenModal] = useState(false)

  const [showNearby, setShowNearby] = useState(false);


  const [account, setAcount] = useState<accountInterface | null>(null)
  const [userProfile, setUserProfile] = useState<bussinessInfoInterface| artistInfoInterface | null>(null)

  const [nearestUsers, setNearestUsers] = useState<{ userProfile : bussinessInfoInterface| artistInfoInterface, account : accountInterface , distance : number}[]>([])

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


  useEffect(() => {
    if(bussinessInfo && artistInfo && currentLocation){

      const radius = 5

      const allNearestUsers : { userProfile : bussinessInfoInterface| artistInfoInterface, account : accountInterface , distance : number}[] = []

      artistInfo.forEach((artist) => {
        if(!artist.artist.location) return null

        if (artist.artist.location?.lat != null && artist.artist.location?.long != null) {
  
          const targetLocation = {
            lat: artist.artist.location.lat,
            lng: artist.artist.location.long,
          };
        
          if (isNear(currentLocation, targetLocation, radius)) {
            allNearestUsers.push({
              userProfile : artist,
              account : artist.artist,
              distance : getDistance(currentLocation, targetLocation )
            })
          }
        }
      })

      bussinessInfo.forEach((bussiness) => {
        if(!bussiness.bussiness.location) return null

        if (bussiness.bussiness.location?.lat != null && bussiness.bussiness.location?.long != null) {
  
          const targetLocation = {
            lat: bussiness.bussiness.location.lat,
            lng: bussiness.bussiness.location.long,
          };
        
          if (isNear(currentLocation, targetLocation, radius)) {
            allNearestUsers.push({
              userProfile : bussiness,
              account : bussiness.bussiness,
              distance : getDistance(currentLocation, targetLocation )
            })
          }
        }
      })
      
      setNearestUsers(allNearestUsers)
    }
  }, [currentLocation, artistInfo, bussinessInfo ])

  



  if(!currentLocation || !user) return <LoadingScreen />

  
  const selectProfile = (userProfile : artistInfoInterface | bussinessInfoInterface , account: accountInterface ) => {
    setAcount(account)
    setUserProfile(userProfile)
    setOpenModal(true)
    setShowNearby(false)
  }




  return (
    <div className="h-dvh w-full relative">

      <div className="absolute top-6 left-15 z-[1100]">
        <button
          onClick={() => setShowNearby((prev) => !prev)}
          className="bg-secondary flex items-center gap-2 rounded-full text-gold  px-4 py-2 shadow-lg border hover:scale-95"
        >
          <Users className="w-4 h-4 text-black-500" />
          <span className="text-sm font-medium">
            Nearby (  <span className=" font-bold text-gold"> {nearestUsers.length} </span>)
          </span>
        </button>

        {showNearby && (
       
       <div className="  overflow-y-auto rounded-xl bg-white shadow-xl border mt-2">
       
       {/* Header */}
       <div className="px-4 py-3 border-b flex items-center gap-2 bg-primary">
         <MapPin className="w-5 h-5 text-black-500" />
         <h2 className="text-sm font-semibold text-gold">
           Nearest Users
         </h2>
         <span className="ml-auto text-xs text-gray-500">
           {nearestUsers.length} found
         </span>
       </div>
       
       {/* List */}
       <div className="divide-y bg-secondary">
         {nearestUsers.map((item) => (
            <ProfileDisplay   key={item.account._id} userProfile={item.userProfile} account={item.account} distance={item.distance} callback={() => selectProfile(item.userProfile, item.account)} />
         ))}
       </div>
       </div>
             )}
      </div>
    

       
     

      {(account && userProfile) &&  <ProfileOverview key={userProfile._id} setPointB={setPointB} userProfile={userProfile} account={account} setOpen={setOpenModal} open={openModal} /> }


     <MapContainer center={[currentLocation?.lat, currentLocation?.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>

      {currentLocation && pointB && (
        <RoutingControl
          waypoints={[
            L.latLng(currentLocation.lat, currentLocation.lng),
            L.latLng(pointB.lat, pointB.lng),
          ]}
        />
      )}

      <Marker position={[currentLocation?.lat, currentLocation?.lng]}  icon={mapIcon(user?.profile)}>
        <Popup> <h1> your current location </h1></Popup> 
      </Marker>
        {"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png "} 
        <TileLayer key={account?._id} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {
            artistInfo?.map((artist) => {

                if(!artist.artist.location) return null
                
                return(
                    <Marker 
                      position={[artist.artist.location.lat!, artist.artist.location.long!]}  
                      icon={mapIcon(artist.artist.profile)} 
                      key={artist._id} 
                      eventHandlers={{
                        click: () => selectProfile(artist, artist.artist),
                      }}
                    >
                    </Marker>
                )
            
            })
                
        }


        {
            bussinessInfo?.map((bussiness) => {

                if(!bussiness.bussiness.location) return null
                
                return(
                    <Marker 
                      key={bussiness._id} 
                      position={[bussiness.bussiness.location.lat!, bussiness.bussiness.location.long!]}  
                      icon={mapIcon("/shop-logo.jpg")}
                      eventHandlers={{
                        click: () => selectProfile(bussiness, bussiness.bussiness),
                      }}
                      
                    >
                    </Marker>
                )
            
            })
                
        }
      
      </MapContainer>
    </div>
  );
};

export default App; 
