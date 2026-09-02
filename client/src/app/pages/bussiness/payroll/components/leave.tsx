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
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert, confirmAlert } from "@/app/utils/alert";
 import useUserStore from "@/app/store/useUserStore";
 import { attendanceInterface } from "@/app/types/attendance.type";
 import {  Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from "@/components/ui/table";
 import { format } from "date-fns";
 import { leaveInterface } from "@/app/types/leave.type";
 import Swal from "sweetalert2"


 //refetch atteandnace
export function LeaveApprovalModal({ refetch } : { refetch : () => void}) {

  const [open, setOpen] = useState(false);

   const { data: leaves , refetch : leaveRefetch} = useQuery({
      queryKey: ["leave_buisness"],
      queryFn: async (): Promise<leaveInterface[]> => {
        const response = await axiosInstance.get(`/account/attendance/leave`);
        return response.data;
      },
    });
  
  const mutation = useMutation({
    mutationFn : (data : { id : string, status : string, isPaid : boolean }) => axiosInstance.put("/account/attendance/leave", data),
    onSuccess : (response) => {
      successAlert("Leave recorded")
      refetch()
      leaveRefetch()
    }, onError : () => errorAlert("error accour")
  })


const handlerAction = async (id: string, action: string) => {
  // First confirmation
    setOpen(false)

  const first = await Swal.fire({
    title: `Do you want to ${action} this leave?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: action,
    cancelButtonText: "Cancel",
  })

  if (!first.isConfirmed) return

  let isPaid = true // default

  // If action is "recorded", ask if paid or unpaid
  if (action.toLowerCase() === "recorded") {
    const { value } = await Swal.fire({
      title: "Is this leave paid or unpaid?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Paid",
      cancelButtonText: "Unpaid",
      allowOutsideClick: false,
    })

    // Paid if confirmed, unpaid if canceled
    isPaid = value === true
  }

  // Finally, call mutation
  mutation.mutate({
    id,
    status: action,
    isPaid,
  })
}
  if(!leaves) return null
    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
            <Button className="flex items-center gap-2 "  onClick={() => setOpen(true)}>
                Leave Approval ({leaves.filter((item) => item.status == "pending").length})
            </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[780px]">
        <DialogHeader>
          <DialogTitle>Leave Approval</DialogTitle>
          <DialogDescription>   
           
          </DialogDescription>
        </DialogHeader>

    
        <div className=" gap-6 mb-6">
        <Table>
                    <TableHeader>
                      <TableRow className="">
                        <TableHead className="font-semibold">Employee</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaves?.filter((item) => item.status == "pending").map((record, index) => (
                        <TableRow 
                          key={index}
                          className={` transition-colors `}
                        >
                          <TableCell className="font-medium">
                             {record.account.name}
                          </TableCell>

                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                             
                              {format(new Date(record.date), "MMM dd, yyyy")}
                            </div>
                          </TableCell>
                         
                         <TableCell className="font-medium">
                             {record.type}
                          </TableCell>
                          

                          <TableCell className="text-right flex justify-end gap-2">
                                <Button className="bg-red-500 hover:bg-red-600" onClick={() => handlerAction(record._id, "rejected")}> Reject </Button>
                                <Button className="bg-green-500 hover:bg-green-600" onClick={() => handlerAction(record._id, "recorded")}> Approve </Button>
                          </TableCell>
                          
                          
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

        </div>

    
      </DialogContent>
    </Dialog>
  )
}
