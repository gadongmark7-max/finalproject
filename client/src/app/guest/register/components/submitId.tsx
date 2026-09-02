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
import { useEffect, useRef, useState } from "react"

export function SubmitId({
  img,
  setImg,
  preview,
  setPreview,
}: {
  img: File | null
  preview: string | null
  setPreview: (val: string) => void
  setImg: (val: File) => void
}) {
  const [open, setOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)


  const handleSelect = (file: File) => {
    setImg(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} className={`w-full ${img ? "text-gold" : "text-stone-400"}`}> {img ? "Change ID" : "Upload ID"} </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Philipine National ID </DialogTitle>
          <DialogDescription>
            Select your Philipine National ID 
          </DialogDescription>
        </DialogHeader>

        {/* Upload Container */}
        <div
          onClick={() => fileRef.current?.click()}
          className="w-full h-62 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer overflow-hidden hover:bg-stone-900 transition"
        >
          {preview ? (
            <img
              src={preview}
              alt="ID Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm text-muted-foreground">
              Click to upload ID
            </span>
          )}
        </div>

        {/* Hidden input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleSelect(e.target.files[0])
            }
          }}
        />

        
      </DialogContent>
    </Dialog>
  )
}