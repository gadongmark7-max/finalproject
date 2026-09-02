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
import { payRollInterface } from "@/app/types/payroll.type"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { successAlert, errorAlert, confirmAlert } from "@/app/utils/alert"
import useUserStore from "@/app/store/useUserStore"

export function ViewPayroll({ payroll, refetch } :  {payroll : payRollInterface, refetch : () => void}) {

  const [open, setOpen] = useState(false);

  const {user} = useUserStore()


  const approveMutation = useMutation({
    mutationFn : (data : { id : string, approveBy : string}) => axiosInstance.put("/account/payroll/approve", data),
    onSuccess : (response) => {
        successAlert(`Expenses Recorded`)
        refetch()
    },
    onError : () => errorAlert("error accour")
  })

  const rejectMutation = useMutation({
    mutationFn : () => axiosInstance.put(`/account/payroll/reject/${payroll._id}`),
    onSuccess : (response) => {
        successAlert(`Record Rejected`)
        refetch()
    },
    onError : () => errorAlert("error accour")
  })



  const rejectHanlder = () => {
    setOpen(false)
    confirmAlert("you want to reject this", "reject", () => {
        rejectMutation.mutate()
    })
  }

  
  const approveHanlder = () => {
    setOpen(false)
    confirmAlert("you want to approve this", "approve", () => {
        if(!user) return
        approveMutation.mutate({
            id : payroll._id,
            approveBy : user?.name
        })
    })
  }

    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
            <Button className="flex items-center gap-2 "  onClick={() => setOpen(true)}>
                View
            </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1025px]  bg-white">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription>   
           
          </DialogDescription>
        </DialogHeader>

    
     
        <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-3xl font-bold tracking-wide text-secondary">
            PAYROLL REGISTER
            </h1>

            <div className="flex justify-between mt-5 text-secondary">
                {payroll.payroll[0].payType === "month" ? (
                <p className="text-lg font-bold">Month: {payroll.payroll[0].month}</p>
                ) : (
                <p className="text-lg font-bold">
                    Period Covered: {payroll.payroll[0].periodFrom} to {payroll.payroll[0].periodTo}
                </p>
                )}

                <p className="text-lg font-bold">
                    Payroll Type: per {payroll.payroll[0].payType}
                </p>
            </div>
            
        </div>
    
        {/* Payroll Table */}
        <div className="overflow-x-auto  ">
            <table className="w-full border-collapse text-xs">
    
            <thead>
                <tr>
                <th className="border border-black p-2">No.</th>
                <th className="border border-black p-2">Employee Name</th>
                <th className="border border-black p-2">Position</th>
                <th className="border border-black p-2">Attendance</th>
                <th className="border border-black p-2">Rate</th>
                <th className="border border-black p-2">Hrs Needed</th>
                <th className="border border-black p-2">Work Hrs</th>
                <th className="border border-black p-2">OT Hrs</th>
                <th className="border border-black p-2">Basic Pay</th>
                <th className="border border-black p-2">OT Pay</th>
                <th className="border border-black p-2">Commission</th>
                <th className="border border-black p-2">Gross Pay</th>
                <th className="border border-black p-2">Deductions</th>
                <th className="border border-black p-2">Net Pay</th>
                
                </tr>
            </thead>
    
            <tbody>
                {payroll.payroll.map((employee, index) => (
                <tr key={employee.employeeId}>
                    <td className="border border-black p-2 text-center">
                    {index + 1}
                    </td>
    
                    <td className="border border-black p-2">
                    {employee.name}
                    </td>
    
                    <td className="border border-black p-2">
                    {employee.role}
                    </td>

                    <td className="border border-black p-2">
                    {employee.attendance}
                    </td>
    
                    <td className="border border-black p-2 text-right">
                    ₱ {employee.rate}
                    </td>

                    <td className="border border-black p-2 text-center">
                    {employee.hrsNeeded}
                    </td>
    
                    <td className="border border-black p-2 text-center">
                    {employee.workHrs.toFixed(2)}
                    </td>
    
                    <td className="border border-black p-2 text-center">
                    {employee.otHrs.toFixed(2)}
                    </td>
    
                    <td className="border border-black p-2 text-right">
                    ₱ {employee.basicPay.toFixed(2).toLocaleString()}
                    </td>
    
                    <td className="border border-black p-2 text-right">
                    ₱ {employee.otPay.toFixed(2).toLocaleString()}
                    </td>
    
                    <td className="border border-black p-2 text-right">
                    ₱ {employee.commisions.toFixed(2).toLocaleString()}
                    </td>
    
                    <td className="border border-black p-2 text-right">
                    ₱ {employee.grossPay.toFixed(2).toLocaleString()}
                    </td>
    
                    <td className="border border-black p-2 text-right">
                    ₱ {employee.totalDeducstions.toFixed(2).toLocaleString()}
                    </td>
    
                    <td className="border border-black p-2 text-right font-bold">
                    ₱ {employee.netPay.toFixed(2).toLocaleString()}
                    </td>
    
                
                </tr>
                ))}
            </tbody>
    
            </table>
        </div>
    
        {/* Footer Section */}
        <div className="mt-10 grid grid-cols-3 gap-10 text-sm">
    
            <div className="text-center">
                <p className="font-medium">
                    {payroll?.preparedBy}
                </p>

                <div className="border-t border-black mt-6 pt-2">
                    <p>Prepared By</p>
                </div>
            </div>

    
            <div className="text-center">
                <p className="font-medium">
                    {payroll?.approveBy || "."}
                </p>

                <div className="border-t border-black mt-6 pt-2">
                    <p>  Approved By </p>
                </div>
            </div>
        </div>
            
        <DialogFooter>
          {payroll.status == "pending" && (
            <>
             <Button className="bg-red-500 hover:bg-red-600 shadow" onClick={rejectHanlder}>  Reject  </Button>
             <Button className="bg-green-500 hover:bg-green-600 shadow" onClick={approveHanlder}>  Approve  </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
