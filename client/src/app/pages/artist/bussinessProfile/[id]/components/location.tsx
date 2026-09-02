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
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert } from "@/app/utils/alert";
import { mapIcon } from "@/app/utils/customFunction";


interface ClickableMapProps {
    bussinessInfo : bussinessInfoInterface,
}




const MapLocation: React.FC<ClickableMapProps>  = ({ bussinessInfo }) => {

  const location = bussinessInfo.bussiness.location 


  const [mapLocation, setMapLocation] = useState<any>(location)

  const [open, setOpen] = useState(false);


  const defaultPosition: L.LatLngExpression = [14.315885007395133, 120.94680688824083]; 


    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {!open && (
            <div className="w-full h-full rounded" onClick={() => setOpen(true)}> 
                <MapContainer 
                  key={bussinessInfo._id} 
                  center={location ? [location.lat!, location.long!] : defaultPosition } 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }} 
                  dragging={false}
                  scrollWheelZoom={false}
                  doubleClickZoom={false}
                  zoomControl={false}
                  touchZoom={false}
                  keyboard={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                 
                  {location && (
                      <Marker position={[location.lat!, location.long!]} icon={mapIcon(bussinessInfo.bussiness.profile)}>
              
                      </Marker>
                  )}
              </MapContainer>
            </div>
        )}
      </DialogTrigger>
      <DialogHeader>
          <DialogTitle>     </DialogTitle>
          <DialogDescription>   
           
          </DialogDescription>
        </DialogHeader>
      <DialogContent className="sm:max-w-[825px] h-[600px]">

    
        <div className=" gap-6 w-full h-[500px] mt-10">
         
        <MapContainer center={defaultPosition} zoom={13} style={{ height: '90%', width: '100%' }}  key={bussinessInfo._id} >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    
        {mapLocation && (
            <Marker position={[mapLocation.lat, mapLocation.long]} icon={mapIcon(bussinessInfo.bussiness.profile)}>
         
            </Marker>
        )}
        </MapContainer>


        </div>

      
      </DialogContent>
    </Dialog>
  )
}


export default MapLocation;