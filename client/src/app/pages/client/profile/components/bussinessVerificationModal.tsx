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
import { Plus, ImageIcon, LoaderCircle, DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { errorAlert, successAlert } from "@/app/utils/alert"
import axios from "axios"
import { idVerificationFormat } from "@/app/utils/idverification"
 
export function BussinessVerifiactionModal() {
  const [open, setOpen] = useState(false);

  // Two files now
  const [BarangayClearance, setBarangayClearance] = useState<File | null>(null)
  const [businessPermit, setBusinessPermit] = useState<File | null>(null)

  const [previewBarangayClearance, setPreviewBarangayClearance] = useState<string | null>(null)
  const [previewBusinessPermit, setPreviewBusinessPermit] = useState<string | null>(null)

  const [bussinessName, setBussinessName] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [clearanceDate, setClearanceDate] = useState("");

  const [clearanceIsCorrectFormat, setClearanceIsCorrectFormat] = useState<boolean | null>(null)
  const [permitIsCorrectFormat, setPermitIsCorrectFormat] = useState<boolean | null>(null)

  const submitMutation = useMutation({
    mutationFn : (data : FormData) => axiosInstance.post("/account/BussinessVerification/submit", data),
    onSuccess : () => {
        successAlert("Request Submitted")
        setOpen(false)
        setBarangayClearance(null)
        setBusinessPermit(null)
        setPreviewBarangayClearance(null)
        setPreviewBusinessPermit(null)
        setBussinessName("")
        setExpirationDate("")
        setClearanceDate("")
    },
    onError : () => errorAlert("Error occurred")
  })


  
  const cleranceMutation = useMutation({
      mutationFn: (data: FormData) => axios.post("https://api.ocr.space/parse/image", data),
      onSuccess: (data) => {
  
        const textContent = data.data.ParsedResults[0].ParsedText
  
        if(!textContent){
          errorAlert("invalid ID image")
          setClearanceIsCorrectFormat(false)
          return
        }  
  
        const hasKeyword = idVerificationFormat['BarangayClearance'].some(keyword => textContent.includes(keyword));
       
        
        if(hasKeyword){
           setClearanceIsCorrectFormat(true)
        } else {
          setClearanceIsCorrectFormat(false)
        }
        
      },
      onError: (err: { request: { response: string } }) => {
        errorAlert(err.request.response);
      },
  });



  const permitMutation = useMutation({
      mutationFn: (data: FormData) => axios.post("https://api.ocr.space/parse/image", data),
      onSuccess: (data) => {
  
        const textContent = data.data.ParsedResults[0].ParsedText
  
        if(!textContent){
          errorAlert("invalid ID image")
          setPermitIsCorrectFormat(false)
          return
        }  
  
        const hasKeyword = idVerificationFormat['bussinessPermit'].some(keyword => textContent.includes(keyword));
       
        
        if(hasKeyword){
           setPermitIsCorrectFormat(true)
        } else {
          setPermitIsCorrectFormat(false)
        }
        
      },
      onError: (err: { request: { response: string } }) => {
        errorAlert(err.request.response);
      },
  });

  const handleFileChange = (file: File | null, type: "BarangayClearance" | "businessPermit") => {
    if(!file) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("apikey", "K85466001188957")

    if (type === "BarangayClearance") {
      setBarangayClearance(file)
      setPreviewBarangayClearance(file ? URL.createObjectURL(file) : null)
      cleranceMutation.mutate(formData)
    } else {
      setBusinessPermit(file)
      setPreviewBusinessPermit(file ? URL.createObjectURL(file) : null)
      permitMutation.mutate(formData)
    }
  }

  const handleSubmit = () => {
    if (!BarangayClearance || !businessPermit || !bussinessName || !expirationDate || !clearanceDate) {
      return errorAlert("Please fill all required fields and select both files")
    }

    const formData = new FormData()
    formData.append("BarangayClearance", BarangayClearance)
    formData.append("businessPermit", businessPermit)
    formData.append("bussinessName", bussinessName)
    formData.append("expirationDate", expirationDate) // Business Permit expiration
    formData.append("clearanceExpiration", clearanceDate)   // Barangay Clearance expiration

    submitMutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}> Apply As Business </Button>
      </DialogTrigger>
  
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="text-center">
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>Wait for Admin approval</DialogDescription>
        </DialogHeader>
  
        {/* CENTER CONTAINER */}
        <div className="">
          {/* ROW: Business Name + Barangay Clearance Expiration */}

          <div className="flex-1 space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Business Name
              </Label>
              <Input
                placeholder="Business Name"
                value={bussinessName}
                type="text"
                onChange={(e) => setBussinessName(e.target.value)}
              />
          </div>


          <div className="flex gap-4 mt-5">
            {/* Business Name */}
     
       

            {/* Barangay Clearance Expiration */}
            <div className="flex-1 space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                 Clearance Expiration
              </Label>
              <Input
                type="date"
                placeholder="Clearance Expiration"
                value={clearanceDate}
                onChange={(e) => setClearanceDate(e.target.value)}
              />
            </div>


               {/* Business Permit Expiration */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
               Permit Expiration
            </Label>
            <Input
              type="date"
              placeholder="Permit Expiration Date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>

          </div>


      {/* FILE UPLOADS */}
      <div className="w-full max-w-[450px] grid grid-cols-2 gap-4 mt-7">
        {/* Barangay Clearance */}
        <div className="flex flex-col items-center space-y-2">
          <Label className="flex items-center justify-between w-full">
            <span className="font-semibold">Barangay Clearance</span>
            {BarangayClearance !== null && (
              <span
                className={`text-xs scale-75 font-semibold px-2 py-1 rounded ${
                  clearanceIsCorrectFormat === true
                    ? "bg-green-500 text-white"
                    : clearanceIsCorrectFormat === false
                    ? "bg-red-500 text-white"
                    : "hidden"
                }`}
              >
                {clearanceIsCorrectFormat === true
                  ? "Verified"
                  : clearanceIsCorrectFormat === false
                  ? "Rejected"
                  : ""}
              </span>
            )}
          </Label>
          {previewBarangayClearance ? (
            <img
              src={previewBarangayClearance}
              alt="valid id preview"
              className="w-[190px] h-[150px] object-cover rounded border-3 border-black"
            />
          ) : (
            <div className="w-[190px] h-[150px] border-3 border-black rounded flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={e => handleFileChange(e.target.files?.[0] || null, "BarangayClearance")}
            className="text-sm"
          />
        </div>

        {/* Business Permit */}
        <div className="flex flex-col items-center space-y-2">
          <Label className="flex items-center justify-between w-full">
            <span className="font-semibold">Business Permit</span>
            {businessPermit !== null && (
              <span
                className={`text-xs scale-75 font-semibold px-2 py-1 rounded ${
                  permitIsCorrectFormat === true
                    ? "bg-green-500 text-white"
                    : permitIsCorrectFormat === false
                    ? "bg-red-500 text-white"
                    : "hidden"
                }`}
              >
                {permitIsCorrectFormat === true
                  ? "Verified"
                  : permitIsCorrectFormat === false
                  ? "Rejected"
                  : ""}
              </span>
            )}
          </Label>
          {previewBusinessPermit ? (
            <img
              src={previewBusinessPermit}
              alt="business permit preview"
              className="w-[190px] h-[150px] object-cover rounded border-3 border-black"
            />
          ) : (
            <div className="w-[190px] h-[150px] border-3 border-black rounded flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={e => handleFileChange(e.target.files?.[0] || null, "businessPermit")}
            className="text-sm"
          />
        </div>
      </div>

        </div>

        <DialogFooter className="flex justify-center">
          <Button disabled={submitMutation.isPending || !clearanceIsCorrectFormat || !permitIsCorrectFormat} className="w-full" onClick={handleSubmit}>
            {submitMutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
            Submit Documents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}