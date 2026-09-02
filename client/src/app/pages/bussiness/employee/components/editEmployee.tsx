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
 import { bussinessInfoInterface } from "@/app/types/accounts.type"
 import { useQuery, useMutation } from "@tanstack/react-query"
 import axiosInstance from "@/app/utils/axios"
 import { employeeInterface, accountInterface } from "@/app/types/accounts.type"
 import { confirmAlert, successAlert,errorAlert } from "@/app/utils/alert"
import { ShieldAlert } from "lucide-react"

export function EditEmployeeRole({ refetch, bussinessInfo, employeeInfo } : {employeeInfo : employeeInterface , refetch : () => void, bussinessInfo : bussinessInfoInterface}) {

  const [open, setOpen] = useState(false);

  const updateMutation = useMutation({
    mutationFn : (data : { employeeInfoId : string , role : string, permissions : string[] }) => axiosInstance.put("/account/employee/role", data),
    onSuccess : () => {
        successAlert(`Role Changed`)
        setOpen(false)
        refetch()
    },
    onError : () => errorAlert("error accour")
  })

  

  const updateRoleHandler = (role : string, permissions : string[]) => {
    setOpen(false)
    confirmAlert("you want to change employee role?", "change role", () => {
        updateMutation.mutate({
            role,
            permissions,
            employeeInfoId : employeeInfo._id
        })
    })
  }


    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
            <Button   onClick={() => setOpen(true)}>
                <ShieldAlert />
            </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>   
           choose available roles
          </DialogDescription>
        </DialogHeader>

    
        <div className=" gap-6 mb-6">
            <div className="space-y-2">
            <h2 className="text-sm text-gold font-medium flex items-center gap-2">
                Role
            </h2>

            <div className="grid grid-cols-3 gap-3">
                {bussinessInfo.roles.map((item, index) => (
                <button
                    key={index}
                    onClick={() => updateRoleHandler(item.role, item.permissions)}
                    className={`border rounded-lg p-3 text-left hover:border-stone-300 transition text-gold
                        ${employeeInfo?.role === item.role ? "border-gold" : ""}
                    `}
                > 
                    <p className="font-semibold text-sm">{item.role}</p>
                    <p className="text-xs text-muted-foreground">
                    {item.permissions.length} permissions
                    </p>
                </button>
                ))}
            </div>
            </div>

        </div>

        
      </DialogContent>
    </Dialog>
  )
}
