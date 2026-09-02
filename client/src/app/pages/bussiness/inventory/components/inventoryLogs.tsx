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
import { LogsIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { inventoryLogInterface } from "@/app/types/inventory.type"
import useUserStore from "@/app/store/useUserStore"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function InventoryLogs() {

  const {user} = useUserStore()

  const [open, setOpen] = useState(false);

  const { data: inventoryLogs } = useQuery({
    queryKey: ['inventory_log'],
    queryFn: async (): Promise<inventoryLogInterface[]> => {
      const response = await axiosInstance.get(`/inventory/logs/${user?._id}`);
      return response.data;
    },
    refetchInterval : 3000
  });

  if(!inventoryLogs) return <div> loading.... </div>

    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
            <Button hoverText={"Inventory Logs"} className="flex items-center gap-2 "  onClick={() => setOpen(true)}>
                <LogsIcon />
            </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[825px] overflow-auto max-h-[600px] ">
        <DialogHeader>
          <DialogTitle>Inventory Logs</DialogTitle>
          <DialogDescription>   
           Recorded Movement  inventory
          </DialogDescription>
        </DialogHeader>

    
        <div className=" gap-6 mb-6  ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Message</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Action By</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {inventoryLogs.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.message}</TableCell>
                <TableCell>
                  {item.type === "deduct" ? (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">
                     Deduct
                    </span>
                  ) : item.type === "update" ? (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-700">
                      Edit
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
                      Add
                    </span>
                  )}
                </TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.time}</TableCell>
                <TableCell>{item.actionBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>

      </DialogContent>
    </Dialog>
  )
}
