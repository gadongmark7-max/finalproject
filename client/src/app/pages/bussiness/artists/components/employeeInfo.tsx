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
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { employeeInfo } from "@/app/types/accounts.type"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { successAlert, errorAlert, confirmAlert } from "@/app/utils/alert"

const palceHolder = {
    fullname : "",
    email : "",
    contact : "",
    dateOfBirth : "",
    Gender : "",
    civilStatus : "",
    address : "",
    TIN : "",
    SSS : "",
    PhilHealth : "",
    PagIbig : "",
}

export function EmployeeInfo({
  info,
  refetch,
  employeeId,
  businessId
}: {
  info: employeeInfo,
  refetch: () => void,
  employeeId: string,
  businessId : string
}) {

  

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<employeeInfo>(info || palceHolder);

  const handleChange = (key: keyof employeeInfo, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // ✅ UPDATE
  const updateMutation = useMutation({
    mutationFn: () =>
      axiosInstance.put("/account/employee/info", {
        employeeId,
        businessId,
        type: "artist",
        info: form
      }),
    onSuccess: () => {
      successAlert("Employee updated")
      setOpen(false)
      refetch()
    },
    onError: () => errorAlert("Update failed")
  })

  // ✅ DELETE
  const deleteMutation = useMutation({
    mutationFn: () =>
      axiosInstance.put(`/account/employee/remove`, {
        employeeId,
        businessId,
        type : "artist"
      }),
    onSuccess: () => {
      successAlert("Employee removed")
      setOpen(false)
      refetch()
    },
    onError: () => errorAlert("Delete failed")
  })


  const handleRemove = () => {
    setOpen(false)
    confirmAlert('you want to Remove this employee?', "remove" , () => {
        deleteMutation.mutate()
    })
  }

 

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          view
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle >
            Employee Info
         
          

          </DialogTitle>
          <DialogDescription className="flex justify-between">
           <span>  Update employee details </span>

            <Button
                variant="destructive"
                onClick={handleRemove}
                disabled={deleteMutation.isPending}
                className="scale-75"
            >
                {deleteMutation.isPending ? "Deleting..." : "Remove Employee"}
            </Button>
          </DialogDescription>
        </DialogHeader>

        {/* ✅ 2 COLUMN GRID */}
        <div className="grid grid-cols-2 gap-3 mb-4">

          <Input
            placeholder="Fullname"
            value={form.fullname}
            onChange={(e) => handleChange("fullname", e.target.value)}
            className="col-span-2"
          />

          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <Input
            placeholder="Contact"
            value={form.contact}
            onChange={(e) => handleChange("contact", e.target.value)}
          />

          <Input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
          />

          {/* ✅ Gender Select */}
          <select
            value={form.Gender}
            onChange={(e) => handleChange("Gender", e.target.value)}
            className="border rounded px-2 py-2 text-white"
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* ✅ Civil Status Select */}
          <select
            value={form.civilStatus}
            onChange={(e) => handleChange("civilStatus", e.target.value)}
            className="border rounded px-2 py-2 text-white"
          >
            <option value="">Civil Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
          </select>

          <Input
            placeholder="TIN"
            value={form.TIN}
            onChange={(e) => handleChange("TIN", e.target.value)}
          />

          <Input
            placeholder="SSS"
            value={form.SSS}
            onChange={(e) => handleChange("SSS", e.target.value)}
          />

          <Input
            placeholder="PhilHealth"
            value={form.PhilHealth}
            onChange={(e) => handleChange("PhilHealth", e.target.value)}
          />

          <Input
            placeholder="Pag-IBIG"
            value={form.PagIbig}
            onChange={(e) => handleChange("PagIbig", e.target.value)}
          />

          <Input
            placeholder="Address"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="col-span-2"
          />

        </div>

        {/* ✅ FOOTER BUTTONS */}
        <DialogFooter className="">

        
          {/* 💾 SAVE BUTTON */}
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="w-full"
          >
            {updateMutation.isPending ? "Updating..." : "Save"}
          </Button>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}