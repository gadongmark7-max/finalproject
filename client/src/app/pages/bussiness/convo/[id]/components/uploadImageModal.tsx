"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { Plus, LoaderCircle , ImageIcon} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { errorAlert, successAlert } from "@/app/utils/alert"
import { convoInterface } from "@/app/types/convo.type"

export function UploadImageModal({ convoId, setConvo }: { convoId: string, setConvo : (data : convoInterface | null) => void }) {
  const [open, setOpen] = useState(false)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileType, setFileType] = useState<"image" | "video" | null>(null)

  const uploadMutation = useMutation({
    mutationFn: (data: FormData) =>
      axiosInstance.post("/convo/message/file", data),
    onSuccess: (response) => {
      setConvo(response.data)
      setFile(null)
      setPreview(null)
      setFileType(null)
      setOpen(false)
    },
    onError: () => errorAlert("Upload error"),
  })
  

  const handleFileChange = (file: File | null) => {
    setFile(file)
    if (!file) {
      setPreview(null)
      setFileType(null)
      return
    }

    setPreview(URL.createObjectURL(file))

    if (file.type.startsWith("video")) {
      setFileType("video")
    } else if (file.type.startsWith("image")) {
      setFileType("image")
    } else {
      setFileType(null)
    }
  }

  const handleUpload = () => {
    if (!file) return errorAlert("No file selected")
    const formData = new FormData()
    formData.append("file", file)
    formData.append("convoId", convoId)
    uploadMutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon"   onClick={() => setOpen(true)}>
          <ImageIcon className="w-5 h-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="text-center">
          <DialogTitle>Send Media</DialogTitle>
        </DialogHeader>

        {/* CENTER PREVIEW */}
        <div className="flex justify-center">
          <div className="w-full max-w-[350px] space-y-4">
            {preview ? (
              fileType === "video" ? (
                <video
                  src={preview}
                  className="w-full h-[400px] object-cover rounded"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-[400px] object-cover rounded"
                />
              )
            ) : (
              <div className="w-full h-[400px] border rounded flex items-center justify-center text-muted-foreground">
                No file selected
              </div>
            )}

            <Input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-center">
          <Button
            className="w-full"
            disabled={uploadMutation.isPending}
            onClick={handleUpload}
          >
            {uploadMutation.isPending && (
              <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
            )}
            send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
