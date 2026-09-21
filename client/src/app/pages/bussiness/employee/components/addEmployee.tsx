"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import {
  accountInterface,
  bussinessInfoInterface,
} from "@/app/types/accounts.type";
import { errorAlert, confirmAlert, successAlert } from "@/app/utils/alert";
import { Plus } from "lucide-react";
import { accountInterfaceInput } from "@/app/types/accounts.type";
import {
  LoaderCircle,
  User,
  Lock,
  Eye,
  EyeOff,
  PhoneIncoming,
  Sparkles,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useZodForm } from "@/lib/validation/useZodForm";
import {
  addEmployeeSchema,
  type AddEmployeeValues,
} from "@/lib/validation/schemas/staff";
import { FieldError } from "@/components/ui/field-error";
import { Controller } from "react-hook-form";

export function AddEmployee({
  refetch,
  bussinessInfo,
}: {
  refetch: () => void;
  bussinessInfo: bussinessInfoInterface;
}) {
  const [open, setOpen] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useZodForm(addEmployeeSchema, {
    defaultValues: {
      name: "",
      email: "",
      contact: "",
      role: "",
      password: "",
      confirmPassword: "",
    },
  });

  const AddMutation = useMutation({
    mutationFn: (data: {
      accountData: accountInterfaceInput;
      role: string;
      permissions: string[];
    }) => axiosInstance.post("/account/add/employee", data),
    onSuccess: () => {
      successAlert(`employee successfully added`);
      setOpen(false);
      refetch();
      setIsLoading(false);
      reset();
    },
    onError: () => {
      errorAlert("error occur");
      setIsLoading(false);
    },
  });

  const addHandler = handleSubmit((values: AddEmployeeValues) => {
    const selectedRole = bussinessInfo.roles[Number(values.role)];
    if (!selectedRole) return errorAlert("Please select a role");

    const account: accountInterfaceInput = {
      name: values.name,
      type: "employee",
      email: values.email,
      password: values.password,
      contact: values.contact,
      profile: "/default_profile.jpg",
      location: null,
      subscriptionExpiration: null,
      isBan: false,
      pin: null,
    };

    setIsLoading(true);

    AddMutation.mutate({
      accountData: account,
      role: selectedRole.role,
      permissions: selectedRole.permissions,
    });
  });

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
          <DialogDescription>Search Employee</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 ">
          <div className="space-y-6">
            <h1 className="font-bold text-3xl text-gold">
              {" "}
              Register Employee{" "}
            </h1>

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
                    {...register("name")}
                    aria-invalid={!!errors.name}
                    placeholder="Enter name"
                    className="block w-full pl-10 py-3 border-0 border-b-2  bg-transparent focus:border-stone-600 text-sm"
                  />
                </div>
                <FieldError>{errors.name?.message}</FieldError>
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
                    inputMode="numeric"
                    {...register("contact", {
                      onChange: (e) => {
                        e.target.value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 11);
                      },
                    })}
                    aria-invalid={!!errors.contact}
                    placeholder="09XXXXXXXXX"
                    className="block w-full pl-10 py-3 border-0 border-b-2  bg-transparent focus:border-stone-600 text-sm"
                  />
                </div>
                <FieldError>{errors.contact?.message}</FieldError>
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
                    type="email"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                    placeholder="Enter Email"
                    className="block w-full pl-10 pr-3 py-3 border-0 border-b-2  bg-transparent focus:outline-none focus:border-stone-600 focus:ring-0 transition-colors duration-200 text-sm"
                  />
                </div>
                <FieldError>{errors.email?.message}</FieldError>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className=" w-full mt-5">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {bussinessInfo.roles.map((item, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {" "}
                            {item.role}{" "}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError>{errors.role?.message}</FieldError>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"></div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    aria-invalid={!!errors.password}
                    placeholder="Enter password"
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
                <FieldError>{errors.password?.message}</FieldError>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"></div>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    aria-invalid={!!errors.confirmPassword}
                    placeholder="Confirm password"
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
                <FieldError>{errors.confirmPassword?.message}</FieldError>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={addHandler}
                disabled={isLoading || !isValid}
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
  );
}
