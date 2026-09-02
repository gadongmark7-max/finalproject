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



export function ChangeProfile({ profile } : { profile : string}) {

  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient()

  const [img, setImg] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>(profile)

  const uploadMutation = useMutation({
    mutationFn : (data : FormData) => axiosInstance.post("/account/changeProfilePic", data),
    onSuccess : () => {
        successAlert("profile changed")
        setOpen(false)
        setImg(null)
        queryClient.invalidateQueries({ queryKey: ["bussiness_profile"] })
    },
    onError : () => errorAlert("error accour")
  })

 
  const handleImageChange = (file: File | null) => {
    setImg(file)
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleUploadImg = () => {
    if(!img) return errorAlert("no selected file")
    const formData = new FormData()
    formData.append("file", img)
    uploadMutation.mutate(formData)
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <img
            src={profile}
            alt="artist profile"
            className="w-42 h-42 rounded-full object-cover border cursor-pointer hover:opacity-80 hover:scale-105 transition"
            onClick={() => setOpen(true)}
        />

      </DialogTrigger>
  
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="text-center">
          <DialogTitle>Change Profile</DialogTitle>
        </DialogHeader>
  
        {/* CENTER CONTAINER */}
        <div className="flex justify-center">
          <div className="w-full max-w-[350px] space-y-4">
  
            {/* IMAGE PREVIEW */}
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-[300px]  h-[300px] object-cover rounded-full m-auto"
              />
            ) : (
              <div className="w-[300px]  h-[300px] border rounded-full flex items-center justify-center text-muted-foreground m-auto">
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
          <Button disabled={uploadMutation.isPending} className="w-full " onClick={handleUploadImg}> {uploadMutation.isPending &&   <LoaderCircle className="h-4 w-4 animate-spin" />} Change Profile </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
  
}
