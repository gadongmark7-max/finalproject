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
 import { Plus, ImageIcon, LoaderCircle } from "lucide-react"
 import { Input } from "@/components/ui/input"
 import { Label } from "@/components/ui/label"
 import { useMutation } from "@tanstack/react-query"
 import axiosInstance from "@/app/utils/axios"
import { errorAlert, successAlert } from "@/app/utils/alert"
import { useQueryClient } from "@tanstack/react-query"
import useUserStore from "@/app/store/useUserStore"


export function ArtistVerifiactionModal() {

  const [open, setOpen] = useState(false);


  const [img, setImg] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const submitMutation = useMutation({
    mutationFn : (data : FormData) => axiosInstance.post("/account/artistVerification/submit", data),
    onSuccess : (response) => {
        successAlert("Request Submited")
        setOpen(false)
        setImg(null)
    },
    onError : () => errorAlert("error accour")
  })

 
  const handleImageChange = (file: File | null) => {
    setImg(file)
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = () => {
    if(!img) return errorAlert("no selected file")
    const formData = new FormData()
    formData.append("file", img)
    formData.append("type", "artist")
    submitMutation.mutate(formData)
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}> Apply As Artist  </Button>

      </DialogTrigger>
  
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="text-center">
          <DialogTitle>Upload Valid ID</DialogTitle>
          <DialogDescription>   
           Wait for Admin approval
          </DialogDescription>
        </DialogHeader>
  
        {/* CENTER CONTAINER */}
        <div className="flex justify-center">
          <div className="w-full max-w-[350px] space-y-4">
  
            {/* IMAGE PREVIEW */}
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-[300px]  h-[300px] object-cover rounded m-auto"
              />
            ) : (
              <div className="w-[300px]  h-[300px] border rounded flex items-center justify-center text-muted-foreground m-auto">
                No image
              </div>
            )}
  
            {/* FILE INPUT */}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleImageChange(e.target.files?.[0] || null)
              }
              className="mt-4"
            />
          </div>
        </div>
  
        <DialogFooter className="flex justify-center">
          <Button disabled={submitMutation.isPending} className="w-full " onClick={handleSubmit}> {submitMutation.isPending &&   <LoaderCircle className="h-4 w-4 animate-spin" />} Submit Valid ID </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
  
}
