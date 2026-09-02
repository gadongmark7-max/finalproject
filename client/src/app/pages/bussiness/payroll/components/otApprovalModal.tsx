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
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { format } from "date-fns";
import {   convertToAmPm, getTimeInStatus, getTimeOutStatus } from "@/app/utils/customFunction";

export function OtApprovalModal({ refetch, attendance } : { refetch : () => void, attendance : attendanceInterface[]}) {

  const [open, setOpen] = useState(false);

  
  const mutation = useMutation({
    mutationFn : (data : { id : string, action : string}) => axiosInstance.post("/account/attendance/ot", data),
    onSuccess : (response) => {
      successAlert("Ot recorded")
      refetch()
    }, onError : () => errorAlert("error accour")
  })

  const handlerAction = (id : string, action : string) => {
    setOpen(false)
    confirmAlert(`you want to ${action} ot`, action, () => {
        mutation.mutate({
            id,
            action
        })
    })
  }
    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
            <Button className="flex items-center gap-2 "  onClick={() => setOpen(true)}>
                Ot Approval ({attendance.length})
            </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[780px]">
        <DialogHeader>
          <DialogTitle>Ot Approval</DialogTitle>
          <DialogDescription>   
           
          </DialogDescription>
        </DialogHeader>

    
        <div className=" gap-6 mb-6">
        <Table>
                    <TableHeader>
                      <TableRow className="">
                        <TableHead className="font-semibold">Employee</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Time In</TableHead>
                        <TableHead className="font-semibold">Time Out</TableHead>
                        <TableHead className="font-semibold text-right">Duration</TableHead>
                        <TableHead className="font-semibold text-right">Ot</TableHead>
                        <TableHead className="font-semibold text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendance?.map((record, index) => (
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
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono">{convertToAmPm(record.timeIn)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {record.timeOut ? (
                              <div className="flex items-center gap-2">                              
                                <span className="font-mono">{convertToAmPm(record.timeOut)}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {record.duration > 0 ? (
                              <span className="font-semibold">
                                {record.duration.toFixed(1)} hrs
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Active</span>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            {record?.ot.toFixed(1)}
                          </TableCell>

                          <TableCell className="text-right flex gap-2">
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
