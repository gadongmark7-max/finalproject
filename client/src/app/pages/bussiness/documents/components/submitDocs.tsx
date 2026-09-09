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
import { LoaderCircle, DollarSign, File } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { errorAlert, successAlert } from "@/app/utils/alert"
import { useImageField } from "@/lib/validation/useFileField"
import { FieldError } from "@/components/ui/field-error"
import { firstError, dateStringField } from "@/lib/validation/fields"

const expirationSchema = dateStringField("Expiration date", { future: true })

export function SubmitDocs({ id, document, hasExpiration, refetch  } : {id : string, hasExpiration : boolean, document : string,  refetch : () => void, }) {

  const [open, setOpen] = useState(false);

  const { file: documentFile, preview, error: fileError, onSelect, reset } = useImageField()

  const [expirationDate, setExpirationDate] = useState("");
  const expirationError = hasExpiration ? firstError(expirationSchema, expirationDate) : undefined
  const canSubmit = !!documentFile && (!hasExpiration || expirationSchema.safeParse(expirationDate).success)

  const submitMutation = useMutation({
    mutationFn : (data : FormData) => axiosInstance.put("/account/documents", data),
    onSuccess : () => {
        successAlert("Permit Updated")
        setOpen(false)
        reset()
        setExpirationDate("")
        refetch()
    },
    onError : () => errorAlert("Error occurred")
  })

  const handleSubmit = () => {
    if (!documentFile )  return errorAlert(fileError ?? "Please choose an image")
    if (hasExpiration) {
      const res = expirationSchema.safeParse(expirationDate)
      if (!res.success) return errorAlert(res.error.issues[0]?.message ?? "Expiration date is invalid")
    }

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
                    accept="image/png,image/jpeg,image/webp"
                    onChange={e => onSelect(e.target.files?.[0] || null)}
                    aria-invalid={!!fileError}
                    className="text-sm"
                />
                <FieldError>{fileError}</FieldError>
            </div>

            {hasExpiration && (
              <div className="space-y-2 mt-5">
                <div className="flex justify-between">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Expiration Date
                  </Label>

                </div>

                <div className="flex flex-col gap-1">
                  <Input
                    placeholder="Permit Expiration Date"
                    value={expirationDate}
                    type="date"
                    aria-invalid={!!expirationError}
                    onChange={(e) => setExpirationDate(e.target.value)}
                  />
                  <FieldError>{expirationError}</FieldError>
                </div>

            </div>
            )}
            
          
            
            </div>

  
        <DialogFooter className="flex justify-center">
          <Button disabled={submitMutation.isPending || !canSubmit} className="w-full" onClick={handleSubmit}>
            {submitMutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
            Submit Documents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
