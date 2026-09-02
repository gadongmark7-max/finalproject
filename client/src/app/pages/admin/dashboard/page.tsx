"use client"
import { SetTattoo3DModal } from "@/app/3d/3dTattooModal";
import { ViewTattoo3DModal } from "@/app/3d/3dTattooView";
import { TattooDataInterface } from "@/app/types/threejs.type";
import { useState } from "react";

export default function Page() {

  const [tattooData, setTatooData] = useState<TattooDataInterface | null>(null)

  console.log(tattooData)

  return (
    <div className="w-full min-h-dvh p-6 space-y-6">
       
       
       

      
    </div>
  );
}
