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
import { useState } from "react"
import { Send, Edit3 , Box , Trash, Eye, Copy, Download} from "lucide-react";
import Link from "next/link";
import { worksInterface } from "@/app/types/works.type";
import axiosInstance from "@/app/utils/axios";
import { useMutation } from "@tanstack/react-query";
import { confirmAlert, successAlert, errorAlert } from "@/app/utils/alert";

export function WorkModal({ work , setWorks} : { work : worksInterface, setWorks : ( works : worksInterface[]) => void}) {

  const [open, setOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn : () => axiosInstance.delete(`/works/${work._id}`),
    onSuccess : (response) => {
        successAlert("work deleted")
        setWorks(response.data)
    }
  })

  const handleDelete = () => {
    setOpen(false)
    confirmAlert("you want to delete this work?", "delete", () => {
        deleteMutation.mutate()
    })
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(work.screenShot);
    successAlert("link copied")
  }

  const handleExport = async () => {
    try {
      const response = await fetch(work.screenShot)
      const blob = await response.blob()
  
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
  
      link.href = url
      link.download = "design.png"
      document.body.appendChild(link)
      link.click()
  
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
  
      successAlert("Design exported")
    } catch (error) {
      console.error(error)
      alert("Failed to export image")
    }
  }
  

    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
            <Button className="absolute items-center gap-2 w-full h-full opacity-0 "  onClick={() => setOpen(true)}>
                
            </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tattoo Preview</DialogTitle>
          <DialogDescription>   
          View, edit, or share this design.
          </DialogDescription>
        </DialogHeader>

    
        <div className=" gap-6 mb-6">

            <div className="w-full h-[260px]">
                <img src={work.screenShot} alt="" />
            </div>

            
           <div className="flex justify-around   p-2 mt-10">
              {/* Post */}
              <Link href={`/pages/artist/addPost/${work._id}`}>
                <div className="relative group">
                  <Button className="  p-2">
                    <Send className="w-5 h-5" />
                  </Button>
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2  text-stone-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Post
                  </span>
                </div>
              </Link>

              <Link href={`/pages/artist/addBooking/${work._id}/none`}>
                <div className="relative group">
                  <Button className="  p-2">
                    <Send className="w-5 h-5" />
                  </Button>
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2  text-stone-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Booking
                  </span>
                </div>
              </Link>

        
              {/* Edit */}
              <Link href={`/canva/${work._id}`}>
                <div className="relative group">
                  <Button className="  p-2">
                    <Edit3 className="w-5 h-5" />
                  </Button>
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2  text-stone-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit
                  </span>
                </div>
              </Link>

             

              <div className="relative group">
                <Button className="  p-2" onClick={handleExport}>
                  <Download className="w-5 h-5" />
                </Button>
                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2  text-stone-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  export
                </span>
              </div>

       

              <div className="relative group">
                <Button className="  p-2" onClick={handleDelete}>
                  <Trash className="w-5 h-5" />
                </Button>
                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2  text-stone-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Delete
                </span>
              </div>

            </div>

        </div>


      </DialogContent>
    </Dialog>
  )
}
