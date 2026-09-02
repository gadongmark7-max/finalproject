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
import {
  Plus,
  ShieldCheck,
  UserCog,
  LayoutDashboard,
  CheckCircle,
} from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { errorAlert, successAlert } from "@/app/utils/alert"


const bussinessFeature = [
  "View Dashboard",
  "Manage Profile",
  "Manage Artists",
  "Manage Employee",
  "Manage Payroll",
  "Manage Post",
  "Manage Bookings",
  "Manage Payment",
  "Manage Chat",
  "Manage Financial",
  "Manage Inventory",
  "View Transactions",
  "View Notifications",
  "Manage Role",
  "Manage Documents",
]

const templates = [
  {
    role: "Receptionist",
    permissions: ["Manage Bookings", "Manage Chat", "View Transactions", "Manage Payment"],
  },
  {
    role: "Manager",
    permissions: [
      "Manage Profile",
      "View Notifications",
      "View Transactions",
      "Manage Employee",
      "Manage Post",
      "Manage Financial",
      "Manage Artists",
      "Manage Inventory",
    ],
  },
  {
    role: "HR",
    permissions: ["Manage Artists", "Manage Employee", "View Transactions", "Manage Payroll"],
  },
]

export function AddRolesModal({ refetch }: { refetch: () => void }) {
  const [open, setOpen] = useState(false)
  const [permissions, setPermissions] = useState<string[]>([])
  const [role, setRole] = useState("")

  const AddMutation = useMutation({
    mutationFn: (data: { role: string; permissions: string[] }) =>
      axiosInstance.post("/account/role", data),
    onSuccess: () => {
      successAlert(`role successfully added`)
      setOpen(false)
      refetch()
    },
    onError: () => errorAlert("error accour"),
  })

  const togglePermission = (feature: string) => {
    setPermissions((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    )
  }

  const selectTemplate = (index: number) => {
    if (role != templates[index].role) {
      setRole(templates[index].role)
      setPermissions(templates[index].permissions)
    } else {
      setRole("")
      setPermissions([])
    }
  }

  const addRoleHanlder = () => {
    if (!role || permissions.length == 0) return errorAlert("empty field")
    AddMutation.mutate({ role, permissions })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Add Role
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[840px] bg-secondary border border-border rounded-none p-0 max-h-[650px] ">

        {/* Grain overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-50 opacity-[0.035] h-full "
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />


        <div className="p-8 space-y-8">

          {/* Header */}
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Access Control</span>
            </div>
            <DialogTitle className="flex items-center gap-3 font-light text-2xl tracking-[-0.02em] text-text" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              <div className="bg-surface-alt border border-border p-2">
                <ShieldCheck size={18} className="text-gold" />
              </div>
              Create New Role
            </DialogTitle>
            <DialogDescription className="text-text-muted text-sm leading-relaxed">
              Define a role and control what studio features this member can access.
            </DialogDescription>
          </DialogHeader>

          {/* Role Templates */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-surface-alt border border-border p-1.5">
                <LayoutDashboard size={14} className="text-gold" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Recommended Templates</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {templates.map((item, index) => (
                <button
                  key={index}
                  onClick={() => selectTemplate(index)}
                  className={`relative group bg-surface border p-4 text-left transition-all duration-500 overflow-hidden rounded-none
                    ${role === item.role
                      ? "border-gold"
                      : "border-border hover:border-border-gold"
                    }`}
                >
                  {role === item.role && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "rgba(201,168,76,0.05)" }}
                    />
                  )}
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
                  <p className="text-text text-sm font-light tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {item.role}
                  </p>
                  <p className="text-text-muted text-[11px] mt-1 tracking-wider">
                    {item.permissions.length} permissions
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Role Name */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-surface-alt border border-border p-1.5">
                <UserCog size={14} className="text-gold" />
              </div>
              <label className="text-[10px] uppercase tracking-[0.28em] text-gold">Role Name</label>
            </div>
            <Input
              placeholder="e.g. Supervisor"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <p className="text-[11px] text-text-dim tracking-wider uppercase">
              Displayed when assigning roles to employees
            </p>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-surface-alt border border-border p-1.5">
                <CheckCircle size={14} className="text-gold" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Permissions</span>
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] tracking-widest uppercase text-text-dim">
                {permissions.length} / {bussinessFeature.length} selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {bussinessFeature.map((feature) => (
                <label
                  key={feature}
                  className={`relative group flex items-center gap-3 bg-surface border p-3 cursor-pointer transition-all duration-500 rounded-none overflow-hidden
                    ${permissions.includes(feature)
                      ? "border-gold"
                      : "border-border hover:border-border-gold"
                    }`}
                >
                  {permissions.includes(feature) && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "rgba(201,168,76,0.05)" }}
                    />
                  )}
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
                  <input
                    type="checkbox"
                    checked={permissions.includes(feature)}
                    onChange={() => togglePermission(feature)}
                    className="h-3.5 w-3.5 accent-[#C9A84C] shrink-0"
                  />
                  <span className="text-[11px] text-text-muted uppercase tracking-[0.08em] leading-tight">
                    {feature}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="pt-2 border-t border-border">
            <Button
              className="w-full"
              disabled={AddMutation.isPending}
              onClick={addRoleHanlder}
            >
              {AddMutation.isPending ? (
                <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]">
                  <span className="animate-spin h-3.5 w-3.5 border border-current border-t-transparent rounded-full" />
                  Saving…
                </span>
              ) : (
                <span className="text-[11px] uppercase tracking-[0.2em]">Save Role</span>
              )}
            </Button>
          </DialogFooter>

        </div>
      </DialogContent>
    </Dialog>
  )
}