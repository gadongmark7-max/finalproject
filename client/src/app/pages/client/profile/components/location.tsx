"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { artistInfoInterface } from "@/app/types/accounts.type";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert } from "@/app/utils/alert";
import { mapIcon } from "@/app/utils/customFunction";
import useUserStore from "@/app/store/useUserStore";








  
const MapLocation = () => {

  const {user, setUser} = useUserStore()

  if(!user) return null

  const location = user?.location


  const [mapLocation, setMapLocation] = useState<{ lat: number, long: number } | null>(location)

  const [open, setOpen] = useState(false);

  // Component to handle map clicks
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setMapLocation({
            lat : e.latlng.lat,
            long : e.latlng.lng
        })
      },
    });
    return null;
  };

  const defaultPosition: L.LatLngExpression = [14.315885007395133, 120.94680688824083]; 

  const updateMutation = useMutation({
    mutationFn : (location : { lat : number, long : number}) => axiosInstance.put(`/account/location/${user?._id}`, {location}),
    onSuccess : (response) => {
        setUser(response.data.account)
        setOpen(false)
        successAlert("location updated")
    },
    onError : () => errorAlert('error accour')
  })

  const handleUpdateLocation = () => {
    if(!mapLocation) return errorAlert('please select location')
    updateMutation.mutate(mapLocation)
  }

    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}> Set Location  </Button>
      </DialogTrigger>
      <DialogHeader>
          <DialogTitle>     </DialogTitle>
          <DialogDescription>   
           
          </DialogDescription>
        </DialogHeader>
      <DialogContent className="sm:max-w-[825px] h-[600px]">

    
        <div className=" gap-6 w-full h-[500px] mt-10">
         
        <MapContainer center={defaultPosition} zoom={13} style={{ height: '90%', width: '100%' }}  key={user._id} >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler />
        {mapLocation && (
            <Marker position={[mapLocation.lat, mapLocation.long]} icon={mapIcon(user.profile)}>
         
            </Marker>
        )}
        </MapContainer>

        <Button className="w-full mt-5" onClick={handleUpdateLocation}>
            Save location
        </Button>
       
        </div>

      
      </DialogContent>
    </Dialog>
  )
}


export default MapLocation;