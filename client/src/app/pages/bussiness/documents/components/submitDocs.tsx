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
import { Plus, ImageIcon, LoaderCircle, DollarSign , File} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { errorAlert, successAlert } from "@/app/utils/alert"
import { bussinessInfoInterface } from "@/app/types/accounts.type"


export function SubmitDocs({ id, document, hasExpiration, refetch  } : {id : string, hasExpiration : boolean, document : string,  refetch : () => void, }) {

  const [open, setOpen] = useState(false);

  

  const [documentFile, setDocumentFile] = useState<File | null>(null)

  const [preview, setPreview] = useState<string | null>(null)
  
  const [expirationDate, setExpirationDate] = useState("");



  const submitMutation = useMutation({
    mutationFn : (data : FormData) => axiosInstance.put("/account/documents", data),
    onSuccess : () => {
        successAlert("Permit Updated")
        setOpen(false)
        setDocumentFile(null)
        setPreview(null)
        refetch()
    },
    onError : () => errorAlert("Error occurred")
  })

  const handleFileChange = (file: File | null) => {
    setDocumentFile(file)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  const handleSubmit = () => {
    if (!documentFile )  return errorAlert("no selected image")
    if (!expirationDate && hasExpiration )  return errorAlert("expiration date missing")

    const formData = new FormData()
    formData.append("file", documentFile)
    formData.append("document", document)
    formData.append("expirationDate", expirationDate)
    formData.append("id", id)
    submitMutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>   <File /> </Button>
      </DialogTrigger>
  
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="text-center">
          <DialogTitle> {document} </DialogTitle>
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
              
              

            </div>


        
    
              <div className="flex flex-col items-center space-y-2 mt-5">
              
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
            
            {hasExpiration && (
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
            )}
            
          
            
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
