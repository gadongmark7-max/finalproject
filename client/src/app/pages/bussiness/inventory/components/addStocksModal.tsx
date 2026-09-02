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
import { inventoryInterfaceInput, inventoryInterface } from "@/app/types/inventory.type"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { successAlert, errorAlert, confirmAlert } from "@/app/utils/alert"
import useUserStore from "@/app/store/useUserStore"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
 import { Plus } from "lucide-react"

export function AddStocksModal({ setInventory , inventory} : { inventory : inventoryInterface , setInventory : (data : inventoryInterface[]) => void }) {

  const [open, setOpen] = useState(false);

  const [stocks, setStocks] = useState(0)
  const [expences, setExpences] = useState(0)

  const {user} = useUserStore()


  const mutation = useMutation({
    mutationFn : (data : { inventoryId : string, stocks : number ,expences : number, recordedBy : string} ) => axiosInstance.post("/inventory/addStocks", data),
    onSuccess : (response) => {
        setInventory(response.data)
        successAlert("Stocks Added")
        setStocks(0)
        setOpen(false)
    }, onError : () => errorAlert("error accour")
  })

  const addStocksHandler = () => {
    if(!stocks || !expences || !user) return errorAlert("empty field")
    const recordedBy = user.name
    mutation.mutate({
        inventoryId : inventory._id, 
        stocks,
        expences, 
        recordedBy
    })
}

    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
            <Button className=" "  onClick={() => setOpen(true)}>
               <Plus /> Stocks
            </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>   
           Description
          </DialogDescription>
        </DialogHeader>

    
        <div className=" gap-6 mb-6">
            <div className="mt-3 w-full">
                      <h1 className="font-bold text-stone-600">  Stocks </h1>
                      <Input 
                          value={stocks}
                          type="number"
                          onChange={(e) => setStocks(Number(e.target.value))}
                          placeholder="initial stocks"
                          className="w-full"
                      />
                </div>

                
                <div className="mt-3 w-full">
                        <h1 className="font-bold text-stone-600"> Expences </h1>
                        <Input 
                            value={expences}
                            type="number"
                            onChange={(e) => setExpences(Number(e.target.value))}
                            placeholder="initial stocks"
                            className="w-full"
                        />
                </div>
            
                
               
        </div>

        <DialogFooter>
          <Button type="submit" className="w-full" onClick={addStocksHandler}>  Add Stock  </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
