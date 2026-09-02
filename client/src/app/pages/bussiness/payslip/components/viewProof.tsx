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


  

export function ViewProof({ preview } :  {preview : string}) {


    const [open, setOpen] = useState(false)



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
   
        <Button onClick={() => setOpen(true)}> Proof   </Button>

      </DialogTrigger>
  
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="text-center">
          <DialogTitle>Proof of Salary Acceptance  </DialogTitle>
        </DialogHeader>
  
        {/* CENTER CONTAINER */}
        <div className="flex justify-center">
          <div className="w-full max-w-[350px] space-y-4">
  
            <img
                src={preview}
                alt="preview"
                className="w-full  h-[300px] object-cover  m-auto"
              />
          
            
          </div>
        </div>
  
        <DialogFooter className="flex justify-center">
         
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
  
}