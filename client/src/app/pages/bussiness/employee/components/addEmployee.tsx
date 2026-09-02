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
import { useQuery , useMutation} from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { accountInterface, bussinessInfoInterface } from "@/app/types/accounts.type"
import { errorAlert, confirmAlert, successAlert } from "@/app/utils/alert"
import {
    Plus
  } from "lucide-react"
 import { accountInterfaceInput } from "@/app/types/accounts.type";
 import { LoaderCircle, User, Lock, Eye, EyeOff , PhoneIncoming, Sparkles} from "lucide-react";
 import {
   Select,
   SelectTrigger,
   SelectValue,
   SelectContent,
   SelectItem,
 } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";



export function AddEmployee({ refetch, bussinessInfo } : { refetch : () => void, bussinessInfo : bussinessInfoInterface}) {

  const [open, setOpen] = useState(false);


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [name, setName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [role, setRole] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false)


  const AddMutation = useMutation({
    mutationFn : (data : { accountData : accountInterfaceInput, role : string, permissions : string[] }) => axiosInstance.post("/account/add/employee", data),
    onSuccess : () => {
        successAlert(`employee successfully added`)
        setOpen(false)
        refetch()
        setIsLoading(false)
        setName("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setContact("")
    },
    onError : () => errorAlert("error accour")
  })

  const selectRole = (value : string) => {
    const index = Number(value)
    setRole(bussinessInfo.roles[index].role)
    setPermissions(bussinessInfo.roles[index].permissions)
  }


  const addHandler = () => {
    if(!name ||  !email || !password || !contact || !role || permissions.length == 0) return errorAlert("empty field")

      if(password != confirmPassword) return errorAlert("confirm password not match")
  
      const profile = "/default_profile.jpg"

      const account : accountInterfaceInput = {
        name,
        type : "employee",
        email,
        password,
        contact,
        profile,
        location : null,
        subscriptionExpiration : null,
        isBan : false,
        pin : null
      }
  
      setIsLoading(true)

      AddMutation.mutate({
        accountData : account,
        role : role,
        permissions : permissions
      });
  }


    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Employee
        </Button>
      </DialogTrigger>
  
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Employee
          </DialogTitle>
          <DialogDescription>
           Search Employee
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 ">

        <div  className="space-y-6">

            <h1 className="font-bold text-3xl text-gold"> Register Employee  </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    className="block w-full pl-10 py-3 border-0 border-b-2  bg-transparent focus:border-stone-600 text-sm"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Contact
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIncoming className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Enter contact"
                    className="block w-full pl-10 py-3 border-0 border-b-2  bg-transparent focus:border-stone-600 text-sm"
                  />
                </div>
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border-0 border-b-2  bg-transparent focus:outline-none focus:border-stone-600 focus:ring-0 transition-colors duration-200 text-sm"
                  />
                </div>
              </div>


              <div className="space-y-2">
                <Label>Role</Label>
                <Select onValueChange={selectRole}>
                  <SelectTrigger className=" w-full mt-5">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {bussinessInfo.roles.map((item, index) => (
                       <SelectItem key={index} value={index.toString()}> {item.role} </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>




            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">         
              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                   
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-stone-400  transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-stone-400  transition-colors" />
                    )}
                  </button>
                </div>
              </div>


              <div className="space-y-2">
                <label className="block text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    
                  </div>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                   
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-stone-400  transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-stone-400  transition-colors" />
                    )}
                  </button>
                </div>
              </div>

            </div>


            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={addHandler}
                disabled={isLoading}
                    className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span>creating account...</span>
                  </div>
                ) : (
                  "Register account"
                )}
              </Button>
            </div>
            </div>
        
        </div>


      </DialogContent>
    </Dialog>
  )
}
