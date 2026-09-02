"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { errorAlert, successAlert } from "@/app/utils/alert"
import { Users } from "lucide-react"
import { bussinessInfoInterface } from "@/app/types/accounts.type";

export function LookingForArtist({
  businessInfo,
  
}: {
  businessInfo: bussinessInfoInterface,
 
}) {

  const [open, setOpen] = useState(false);

  const [isLookingArtist, setIsLookingArtist] = useState(businessInfo.isLookingArtist);
  const [jobDescription, setJobDescription] = useState(businessInfo.jobDescription || "");

  const mutation = useMutation({
    mutationFn: (data: { id: string, isLookingArtist: boolean, jobDescription: string }) =>
      axiosInstance.put("/account/jobpost", data),

    onSuccess: () => {
      successAlert("success")
     
    },

    onError: () => errorAlert("error occured")
  });

  const handleToggle = (value: boolean) => {
    setIsLookingArtist(value);

    mutation.mutate({
      id: businessInfo._id,
      isLookingArtist: value,
      jobDescription,
    });
  };

  const handleSaveDescription = () => {
    mutation.mutate({
      id: businessInfo._id,
      isLookingArtist,
      jobDescription,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Job Post
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl  text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5" />
            Job post
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Edit job posting
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">

          {/* ✅ Custom Toggle (integrated) */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-medium text-sm text-white">
                Looking for Artist
              </p>
              <p className="text-xs text-gray-400">
                Enable this if you're hiring tattoo artists
              </p>

              <span className={`text-[10px] font-semibold ${
                isLookingArtist ? "text-green-400" : "text-red-400"
              }`}>
                {isLookingArtist ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>

            <button
              onClick={() => handleToggle(!isLookingArtist)}
              disabled={mutation.isPending}
              className={`relative w-12 h-6 rounded-full transition-all duration-300
                ${isLookingArtist
                  ? "bg-yellow-500 shadow-lg shadow-yellow-500/30"
                  : "bg-stone-600"
                }
                ${mutation.isPending ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md
                  transform transition-all duration-300
                  ${isLookingArtist ? "translate-x-6" : ""}
                `}
              />
            </button>
          </div>

          {/* ✅ Job Description */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-white">Job Description</label>

            <textarea
              className="border border-stone-500  text-white rounded-lg p-2 min-h-[120px]"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Enter job description..."
            />

          
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}