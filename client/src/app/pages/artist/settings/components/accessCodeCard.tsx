"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import axiosInstance from "@/app/utils/axios";
import { errorAlert, successAlert } from "@/app/utils/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ACCESS_CODE_STATUS_KEY = ["artist_access_code_status"];

const errorText = (error: unknown) => {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  return typeof data === "string" && data
    ? data
    : "Could not generate a new access code. Please try again.";
};

export function AccessCodeCard() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string>();
  const [newCode, setNewCode] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const status = useQuery({
    queryKey: ACCESS_CODE_STATUS_KEY,
    queryFn: async (): Promise<{ configured: boolean }> =>
      (await axiosInstance.get("/artist/settings/access-code")).data,
  });

  const mutation = useMutation({
    mutationFn: async (currentPassword: string) =>
      (
        await axiosInstance.post<{ accessCode: string }>(
          "/artist/settings/access-code",
          { currentPassword },
        )
      ).data.accessCode,
    gcTime: 0,
    onSuccess: (accessCode) => {
      setPassword("");
      setNewCode(accessCode);
      setShowCode(false);
      queryClient.setQueryData(ACCESS_CODE_STATUS_KEY, { configured: true });
      successAlert("New access code generated. Your old code no longer works.");
    },
    onError: (error) => {
      const message = errorText(error);
      if (message === "current password is incorrect") {
        setPasswordError("Current password is incorrect.");
      } else {
        errorAlert(message);
      }
    },
  });

  const closeDialog = () => {
    setOpen(false);
    setPassword("");
    setShowPassword(false);
    setPasswordError(undefined);
    setNewCode(null);
    setShowCode(false);
    setCopied(false);
    mutation.reset();
  };

  const generate = () => {
    if (mutation.isPending) return;
    if (!password) {
      setPasswordError("Enter your current password to continue.");
      return;
    }
    setPasswordError(undefined);
    mutation.mutate(password);
  };

  const copyCode = async () => {
    if (!newCode) return;
    try {
      await navigator.clipboard.writeText(newCode);
      setCopied(true);
    } catch {
      errorAlert("Could not copy. Reveal the code and copy it manually.");
    }
  };

  const configured = status.data?.configured;

  return (
    <div className="flex items-start gap-4 bg-surface border border-border p-5">
      <div className="bg-surface-alt border border-border p-3 flex-shrink-0">
        <KeyRound className="w-5 h-5 text-gold" />
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        <div>
          <h2
            className="text-xl font-light text-text"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Access Code
          </h2>
          <p className="text-sm text-text-muted mt-0.5">
            Required after your password every time you sign in.{" "}
            {status.isLoading ? null : status.isError ? (
              <span className="text-danger-light">Could not load status.</span>
            ) : configured ? (
              <span className="inline-flex items-center gap-1 text-success-light">
                <ShieldCheck className="w-3.5 h-3.5" /> Configured
              </span>
            ) : (
              <span className="text-gold">Not set yet.</span>
            )}
          </p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={status.isLoading}>
          {configured ? "Generate New Code" : "Create Access Code"}
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next && !mutation.isPending) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-[440px]">
          {newCode ? (
            <>
              <DialogHeader>
                <DialogTitle>Your new access code</DialogTitle>
                <DialogDescription>
                  Save it somewhere safe. It will not be shown again after you
                  close this window.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex items-center gap-2 border border-border-gold bg-surface-alt px-4 py-3">
                  <span
                    className="flex-1 min-w-0 text-lg tracking-[0.3em] text-gold break-all"
                    aria-live="polite"
                  >
                    {showCode ? newCode : "•".repeat(newCode.length)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCode((prev) => !prev)}
                    aria-label={showCode ? "Hide access code" : "Show access code"}
                    aria-pressed={showCode}
                    className="p-2 text-text-muted hover:text-gold transition-colors"
                  >
                    {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={copyCode}
                    aria-label="Copy access code"
                    className="p-2 text-text-muted hover:text-gold transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="flex items-start gap-2 text-sm text-text-muted">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-gold" />
                  Your previous access code no longer works. Use this new code
                  the next time you sign in.
                </p>
              </div>
              <DialogFooter>
                <Button onClick={closeDialog}>I&apos;ve saved it</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  {configured ? "Generate a new access code?" : "Create your access code"}
                </DialogTitle>
                <DialogDescription>
                  {configured
                    ? "Your current access code will stop working immediately and be replaced by a new one."
                    : "A new access code will be generated for your account."}
                </DialogDescription>
              </DialogHeader>
              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  generate();
                }}
              >
                <Label htmlFor="access-code-current-password">
                  Current password
                </Label>
                <div className="relative">
                  <Input
                    id="access-code-current-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    disabled={mutation.isPending}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError(undefined);
                    }}
                    aria-invalid={!!passwordError}
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-gold transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FieldError>{passwordError}</FieldError>
                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeDialog}
                    disabled={mutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    )}
                    {mutation.isPending ? "Generating…" : "Generate Code"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
