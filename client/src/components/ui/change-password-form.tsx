"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, CheckCircle2 } from "lucide-react";

import axiosInstance from "@/app/utils/axios";
import { errorAlert, successAlert } from "@/app/utils/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { useZodForm } from "@/lib/validation/useZodForm";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/lib/validation/schemas/auth";

export function ChangePasswordForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors, isValid },
  } = useZodForm(changePasswordSchema, {
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordValues) =>
      axiosInstance.put("/account/changePassword", {
        currentPassword: values.currentPassword,
        newPassword: values.password,
      }),
    onSuccess: () => {
      successAlert("Password changed. Please log in again.");
      reset();
      queryClient.clear();
      localStorage.clear();
      sessionStorage.clear();
      router.push("/login");
    },
    onError: (error: any) => {
      if (error?.response?.status === 400) {
        setError("currentPassword", {
          message: "Current password is incorrect",
        });
        return;
      }
      errorAlert("error occur");
    },
  });

  const submitHandler = handleSubmit((values) => mutation.mutate(values));

  return (
    <form onSubmit={submitHandler} className="space-y-5">
      <div className="space-y-2">
        <Label>Current Password</Label>
        <div className="relative">
          <Input
            type={showCurrent ? "text" : "password"}
            {...register("currentPassword")}
            aria-invalid={!!errors.currentPassword}
            placeholder="Enter current password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showCurrent ? (
              <EyeOff className="h-4 w-4 text-text-muted hover:text-gold transition-colors" />
            ) : (
              <Eye className="h-4 w-4 text-text-muted hover:text-gold transition-colors" />
            )}
          </button>
        </div>
        <FieldError>{errors.currentPassword?.message}</FieldError>
      </div>

      <div className="space-y-2">
        <Label>New Password</Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            aria-invalid={!!errors.password}
            placeholder="Min. 8 characters"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-text-muted hover:text-gold transition-colors" />
            ) : (
              <Eye className="h-4 w-4 text-text-muted hover:text-gold transition-colors" />
            )}
          </button>
        </div>
        <FieldError>{errors.password?.message}</FieldError>
      </div>

      <div className="space-y-2">
        <Label>Confirm New Password</Label>
        <div className="relative">
          <Input
            type={showConfirm ? "text" : "password"}
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
            placeholder="Repeat new password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4 text-text-muted hover:text-gold transition-colors" />
            ) : (
              <Eye className="h-4 w-4 text-text-muted hover:text-gold transition-colors" />
            )}
          </button>
        </div>
        {watch("confirmPassword") &&
          watch("confirmPassword") === watch("password") &&
          !errors.confirmPassword && (
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-success-light">
              <CheckCircle2 className="w-3 h-3" /> Passwords match
            </p>
          )}
        <FieldError>{errors.confirmPassword?.message}</FieldError>
      </div>

      <Button
        type="submit"
        disabled={mutation.isPending || !isValid}
        className="w-full"
      >
        {mutation.isPending ? (
          <div className="flex items-center justify-center gap-2">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            <span>Updating...</span>
          </div>
        ) : (
          "Update Password"
        )}
      </Button>
    </form>
  );
}
