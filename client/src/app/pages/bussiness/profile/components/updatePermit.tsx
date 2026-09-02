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
import { useEffect, useState } from "react"
import { Plus, ImageIcon, LoaderCircle, DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { errorAlert, successAlert } from "@/app/utils/alert"
import { bussinessInfoInterface } from "@/app/types/accounts.type"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export function UpdatePermit({ bussinessInfo, refetch } : { bussinessInfo : bussinessInfoInterface, refetch : () => void}) {

  const [open, setOpen] = useState(false);


  const [businessPermit, setBusinessPermit] = useState<File | null>(null)

  const [preview, setPreview] = useState<string | null>(null)
  
  const [document, setDocument] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  

  const submitMutation = useMutation({
    mutationFn : (data : FormData) => axiosInstance.put("/account/documents", data),
    onSuccess : () => {
        successAlert("Permit Updated")
        setOpen(false)
        setBusinessPermit(null)
        setPreview(null)
        refetch()
    },
    onError : () => errorAlert("Error occurred")
  })

  const handleFileChange = (file: File | null) => {
    setBusinessPermit(file)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  const handleSubmit = () => {
    if (!businessPermit || !expirationDate)  return errorAlert("Please select both files")

    const formData = new FormData()
    formData.append("file", businessPermit)
    formData.append("document", businessPermit)
    formData.append("expirationDate", expirationDate)
    formData.append("id", bussinessInfo._id)
    submitMutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}> Documents </Button>
      </DialogTrigger>
  
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="text-center">
          <DialogTitle>Renew Business Permit</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
  
        {/* CENTER CONTAINER */}
        <div className="">

          <div className="space-y-2 mt-5">
                  <div className="flex justify-between">
                    <Label className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Documents
                    </Label>
                   
                  </div>
              
                  <div className="flex gap-2">
                   
                  </div>

            </div>


        
    
              <div className="flex flex-col items-center space-y-2 mt-5">
                <Label>Preview</Label>
                {preview ? (
                    <img
                    src={preview}
                    alt="business permit preview"
                    className="w-full h-[250px] object-cover rounded border-3 border-black"
                    />
                ) : (
                    <div className="w-full h-[250px] border-3 border-black rounded flex items-center justify-center text-muted-foreground">
                    No image
                    </div>
                )}
                <Input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileChange(e.target.files?.[0] || null)}
                    className="text-sm"
                />
            </div>

            
            <div className="space-y-2 mt-5">
                  <div className="flex justify-between">
                    <Label className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                       Expiration Date
                    </Label>
                   
                  </div>
              
                  <div className="flex gap-2">
                    <Input
                      placeholder="Permit Expiration Date"
                      value={expirationDate}
                      min={0}
                      type="date"
                      onChange={(e) => setExpirationDate(e.target.value)}
                    />
                  </div>

            </div>
            
            </div>

  
        <DialogFooter className="flex justify-center">
          <Button disabled={submitMutation.isPending} className="w-full" onClick={handleSubmit}>
            {submitMutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
            Submit Documents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
