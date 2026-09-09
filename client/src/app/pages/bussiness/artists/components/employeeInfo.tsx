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
import { useZodForm } from "@/lib/validation/useZodForm"
import { employeeInfoSchema, type EmployeeInfoValues } from "@/lib/validation/schemas/staff"
import { FieldError } from "@/components/ui/field-error"

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

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useZodForm(employeeInfoSchema, {
    defaultValues: { ...palceHolder, ...(info ?? {}) },
  })

  // ✅ UPDATE
  const updateMutation = useMutation({
    mutationFn: (values: EmployeeInfoValues) =>
      axiosInstance.put("/account/employee/info", {
        employeeId,
        businessId,
        type: "artist",
        info: values
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


  const handleSave = handleSubmit((values) => updateMutation.mutate(values))

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

          <div className="col-span-2">
            <Input
              placeholder="Fullname"
              aria-invalid={!!errors.fullname}
              {...register("fullname")}
            />
            <FieldError>{errors.fullname?.message}</FieldError>
          </div>

          <div>
            <Input
              placeholder="Email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldError>{errors.email?.message}</FieldError>
          </div>

          <div>
            <Input
              placeholder="Contact"
              aria-invalid={!!errors.contact}
              {...register("contact")}
            />
            <FieldError>{errors.contact?.message}</FieldError>
          </div>

          <div>
            <Input type="date" aria-invalid={!!errors.dateOfBirth} {...register("dateOfBirth")} />
            <FieldError>{errors.dateOfBirth?.message}</FieldError>
          </div>

          {/* ✅ Gender Select */}
          <div>
            <select
              {...register("Gender")}
              aria-invalid={!!errors.Gender}
              className="border rounded px-2 py-2 text-white w-full"
            >
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <FieldError>{errors.Gender?.message}</FieldError>
          </div>

          {/* ✅ Civil Status Select */}
          <div>
            <select
              {...register("civilStatus")}
              aria-invalid={!!errors.civilStatus}
              className="border rounded px-2 py-2 text-white w-full"
            >
              <option value="">Civil Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
            <FieldError>{errors.civilStatus?.message}</FieldError>
          </div>

          <div>
            <Input
              placeholder="TIN"
              aria-invalid={!!errors.TIN}
              {...register("TIN")}
            />
            <FieldError>{errors.TIN?.message}</FieldError>
          </div>

          <div>
            <Input
              placeholder="SSS"
              aria-invalid={!!errors.SSS}
              {...register("SSS")}
            />
            <FieldError>{errors.SSS?.message}</FieldError>
          </div>

          <div>
            <Input
              placeholder="PhilHealth"
              aria-invalid={!!errors.PhilHealth}
              {...register("PhilHealth")}
            />
            <FieldError>{errors.PhilHealth?.message}</FieldError>
          </div>

          <div>
            <Input
              placeholder="Pag-IBIG"
              aria-invalid={!!errors.PagIbig}
              {...register("PagIbig")}
            />
            <FieldError>{errors.PagIbig?.message}</FieldError>
          </div>

          <div className="col-span-2">
            <Input
              placeholder="Address"
              aria-invalid={!!errors.address}
              {...register("address")}
            />
            <FieldError>{errors.address?.message}</FieldError>
          </div>

        </div>

        {/* ✅ FOOTER BUTTONS */}
        <DialogFooter className="">

        
          {/* 💾 SAVE BUTTON */}
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !isValid}
            className="w-full"
          >
            {updateMutation.isPending ? "Updating..." : "Save"}
          </Button>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}