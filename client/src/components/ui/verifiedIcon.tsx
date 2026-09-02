import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { documentInterface } from "@/app/types/document.type";
import { isNotVerified } from "@/app/utils/customFunction";

export default function VerifiedIcon({ id } : { id : string }) {

   

    const { data: documents } = useQuery({
        queryKey: ["documents"],
        queryFn: async (): Promise<documentInterface> => {
          const response = await axiosInstance.get(`/account/document/${id}`);
          return response.data;
        },
    });

    if(!documents) return null

    if(isNotVerified(documents)) return null
 

    return(
        <img
            src="/verifiedIcon.jpg"
            alt="Verified Badge"
            className="w-6 h-6 rounded-full mt-2  object-cover"
        />
    )
}