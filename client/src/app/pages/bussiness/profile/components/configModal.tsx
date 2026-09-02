"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { bussinessInfoInterface, configInterface } from "@/app/types/accounts.type"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { errorAlert, successAlert } from "@/app/utils/alert"



export function ConfigModal({ bussinessInfo, refetch }: { bussinessInfo: bussinessInfoInterface , refetch : () => void}) {

  const [open, setOpen] = useState(false);

  const [config, setConfig] = useState(bussinessInfo.config);

  const mutation = useMutation({
    mutationFn : (config : configInterface) => axiosInstance.put(`/account/config/${bussinessInfo._id}`, {config}),
    onSuccess : () => {
        refetch()
    },
    onError : () => errorAlert("error accour")
  })


  const handleToggle = (key: keyof typeof config) => {
    const newConfig = {
      ...config,
      [key]: !config[key],
    };

    setConfig(newConfig);
    mutation.mutate(newConfig)
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Configure Business</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Business Configuration</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">

          {/* Financial */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-stone-400"> Settings</h3>

            <ToggleItem
              label="Allow Artists to Handle Client Payments and Refunds"
              desc="Artists can directly record or receive payments."
              checked={config.artistPayment}
              onChange={() => handleToggle("artistPayment")}
            />

            <ToggleItem
              label="Require Finance Approval for Payroll"
              desc="Payroll must be approved before expense."
              checked={config.financeApproval}
              onChange={() => handleToggle("financeApproval")}
            />

            <ToggleItem
              label="Enable Overtime Salary Charges"
              desc="Overtime will be added to salary."
              checked={config.overTimePayment}
              onChange={() => handleToggle("overTimePayment")}
            />

            <ToggleItem
              label="Allow Artists to Work With Other Businesses"
              desc="Artists can collaborate with other businesses."
              checked={config.artistToOtherBussiness}
              onChange={() => handleToggle("artistToOtherBussiness")}
            />

            <ToggleItem
              label="Allow Artists to Create Posts"
              desc="Artists can publish posts."
              checked={config.artistPost}
              onChange={() => handleToggle("artistPost")}
            />

            <ToggleItem
              label="Allow Artists to Book Appointments"
              desc="Artists can manage bookings."
              checked={config.artistBookAppointment}
              onChange={() => handleToggle("artistBookAppointment")}
            />
          </div>

   

        </div>
      </DialogContent>
    </Dialog>
  )
}


function ToggleItem({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-medium text-sm text-gold">{label}</p>
        <p className="text-xs text-stone-400">{desc}</p>
      </div>

      {/* Custom Toggle */}
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition ${
          checked ? "bg-gold" : "bg-stone-700"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}