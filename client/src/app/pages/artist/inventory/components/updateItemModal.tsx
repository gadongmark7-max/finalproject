import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { inventoryInterfaceInput, inventoryInterface } from "@/app/types/inventory.type"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { successAlert, errorAlert, confirmAlert } from "@/app/utils/alert"
import useUserStore from "@/app/store/useUserStore"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function UpdateItemModal({ setInventory , inventory} : { inventory : inventoryInterface , setInventory : (data : inventoryInterface[]) => void }) {

    const [open, setOpen] = useState(false)

    const { user } = useUserStore()

    const [item, setItem] = useState(inventory.item)
    const [category, setCategory] = useState(inventory.category)
    const [stocks, setStocks] = useState(inventory.stocks)
    const [safeStocks, setSafeStocks] = useState(inventory.safeStock)

    const updateMutation = useMutation({
        mutationFn : (inventory : inventoryInterface, ) => axiosInstance.put("/inventory", {inventory, recordedBy : "none"}),
        onSuccess : (response) => {
            setInventory(response.data)
            successAlert("item updated")
            setOpen(false)
        }, onError : () => errorAlert("error accour")
    })

    const deleteMutation = useMutation({
        mutationFn : () => axiosInstance.delete(`/inventory/${inventory._id}`),
        onSuccess : (response) => {
            setInventory(response.data)
            successAlert("item deleted")
        }, onError : () => errorAlert("error accour")
    })

    const updateHandler = () => {
        if(!user || !item.trim() || !category.trim()) return errorAlert("empty field")
          updateMutation.mutate({
            _id : inventory._id,
            account : user,
            item,
            stocks,
            category,
            type : inventory.type,
            safeStock : safeStocks,
            price : inventory.price
        })
    }

    
    const deleteHandler = () => {
        setOpen(false)
        confirmAlert("you want to delete this Item?", "delete", () => {
            deleteMutation.mutate()
        })
    }    

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger  onClick={() => setOpen(true)}  asChild>
        <Button className=""> Edit  </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>update Item</SheetTitle>
          <SheetDescription>
            update item 
          </SheetDescription>
        </SheetHeader>
            <div className=" rounded-lg  shadow-sm w-full m-auto h-[800px] overflow-auto p-2 ">

                <div className="mt-3 w-full">
                    <h1 className="font-bold text-stone-600"> Item Name </h1>
                    <Input 
                        value={item}
                        onChange={(e) => setItem(e.target.value)}
                        placeholder="item name"
                        className="w-full"
                    />
                </div>

                <div className="space-y-2 mt-2">
                    <Label>Category</Label>
                    <Select onValueChange={setCategory}>
                      <SelectTrigger className=" w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tattoo Equipment">Tattoo Equipment</SelectItem>
                        <SelectItem value="Needles & Cartridges">Needles & Cartridges</SelectItem>
                        <SelectItem value="Inks & Pigments">Inks & Pigments</SelectItem>
                        <SelectItem value="kin Prep & Aftercare">kin Prep & Aftercare</SelectItem>
                        <SelectItem value="Hygiene & Safety">Hygiene & Safety</SelectItem>
                      </SelectContent>
                    </Select>
                </div>



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
                    <h1 className="font-bold text-stone-600"> Safe Stocks </h1>
                    <Input 
                        value={safeStocks}
                        type="number"
                        onChange={(e) => setSafeStocks(Number(e.target.value))}
                        placeholder="initial stocks"
                        className="w-full"
                    />
                </div>
               


                <div className="mt-3 w-full">
                   <Button className="bg-red-500 hover:bg-red-600" onClick={deleteHandler}> Delete Item </Button>
                </div>
               
          
            </div>
        <SheetFooter>
          <Button onClick={updateHandler}>Update Item</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
