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
import { customAccessCodeSchema } from "@/lib/validation/schemas/auth";
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

type Mode = "generate" | "custom";

type AccessCodeResponse = { accessCode?: string; updated?: boolean };

const errorText = (error: unknown, mode: Mode) => {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  return typeof data === "string" && data
    ? data
    : mode === "custom"
      ? "Could not save your access code. Please try again."
      : "Could not generate a new access code. Please try again.";
};

function SecretInput({
  id,
  value,
  onChange,
  visible,
  onToggle,
  disabled,
  invalid,
  autoComplete,
  label,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
  invalid?: boolean;
  autoComplete: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        className="pr-11"
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        aria-pressed={visible}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-gold transition-colors"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export function AccessCodeCard() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("generate");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string>();
  const [customCode, setCustomCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [showCustomCode, setShowCustomCode] = useState(false);
  const [customCodeError, setCustomCodeError] = useState<string>();
  const [confirmCodeError, setConfirmCodeError] = useState<string>();
  const [newCode, setNewCode] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const status = useQuery({
    queryKey: ACCESS_CODE_STATUS_KEY,
    queryFn: async (): Promise<{ configured: boolean }> =>
      (await axiosInstance.get("/artist/settings/access-code")).data,
  });

  const configured = status.data?.configured;

  const resetForm = () => {
    setPassword("");
    setShowPassword(false);
    setPasswordError(undefined);
    setCustomCode("");
    setConfirmCode("");
    setShowCustomCode(false);
    setCustomCodeError(undefined);
    setConfirmCodeError(undefined);
  };

  const mutation = useMutation({
    mutationFn: async (payload: {
      currentPassword: string;
      accessCode?: string;
    }) =>
      (
        await axiosInstance.post<AccessCodeResponse>(
          "/artist/settings/access-code",
          payload,
        )
      ).data,
    gcTime: 0,
    onSuccess: (data) => {
      const wasConfigured = configured;
      queryClient.setQueryData(ACCESS_CODE_STATUS_KEY, { configured: true });
      if (data.accessCode) {
        resetForm();
        setNewCode(data.accessCode);
        setShowCode(false);
        successAlert("New access code generated. Your old code no longer works.");
        return;
      }
      closeDialog();
      successAlert(
        wasConfigured
          ? "Access code updated. Use your new code the next time you sign in."
          : "Access code saved. Use it the next time you sign in.",
      );
    },
    onError: (error) => {
      const message = errorText(error, mode);
      if (message === "current password is incorrect") {
        setPasswordError("Current password is incorrect.");
      } else if (
        mode === "custom" &&
        (error as { response?: { status?: number } })?.response?.status === 400
      ) {
        setCustomCodeError(message);
      } else {
        errorAlert(message);
      }
    },
  });

  const openDialog = (nextMode: Mode) => {
    resetForm();
    setMode(nextMode);
    setOpen(true);
  };

  function closeDialog() {
    setOpen(false);
    resetForm();
    setNewCode(null);
    setShowCode(false);
    setCopied(false);
    mutation.reset();
  }

  const submit = () => {
    if (mutation.isPending) return;

    let accessCode: string | undefined;
    let hasError = false;

    if (mode === "custom") {
      const parsed = customAccessCodeSchema.safeParse(customCode);
      if (!parsed.success) {
        setCustomCodeError(parsed.error.issues[0]?.message);
        hasError = true;
      } else {
        setCustomCodeError(undefined);
        accessCode = parsed.data;
      }

      if (!confirmCode.trim()) {
        setConfirmCodeError("Re-enter your new access code.");
        hasError = true;
      } else if (
        parsed.success &&
        confirmCode.trim().toUpperCase() !== parsed.data.toUpperCase()
      ) {
        setConfirmCodeError("Access codes do not match.");
        hasError = true;
      } else {
        setConfirmCodeError(undefined);
      }
    }

    if (!password) {
      setPasswordError("Enter your current password to continue.");
      hasError = true;
    } else {
      setPasswordError(undefined);
    }

    if (hasError) return;
    mutation.mutate(
      accessCode
        ? { currentPassword: password, accessCode }
        : { currentPassword: password },
    );
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

  const isCustom = mode === "custom";

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
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => openDialog("custom")}
            disabled={status.isLoading}
            className="w-full sm:w-auto"
          >
            {configured ? "Change Access Code" : "Set Your Own Code"}
          </Button>
          <Button
            variant="outline"
            onClick={() => openDialog("generate")}
            disabled={status.isLoading}
            className="w-full sm:w-auto"
          >
            {configured ? "Generate New Code" : "Generate a Code"}
          </Button>
        </div>
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
                  {isCustom
                    ? configured
                      ? "Change your access code"
                      : "Set your access code"
                    : configured
                      ? "Generate a new access code?"
                      : "Create your access code"}
                </DialogTitle>
                <DialogDescription>
                  {isCustom
                    ? `Choose a code with at least 6 characters and no spaces. Codes are not case-sensitive.${
                        configured
                          ? " Your current code will stop working immediately."
                          : ""
                      }`
                    : configured
                      ? "Your current access code will stop working immediately and be replaced by a new one."
                      : "A new access code will be generated for your account."}
                </DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                {isCustom && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="access-code-new">New access code</Label>
                      <SecretInput
                        id="access-code-new"
                        label="access code"
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        value={customCode}
                        visible={showCustomCode}
                        onToggle={() => setShowCustomCode((prev) => !prev)}
                        disabled={mutation.isPending}
                        invalid={!!customCodeError}
                        onChange={(value) => {
                          setCustomCode(value);
                          if (customCodeError) setCustomCodeError(undefined);
                        }}
                      />
                      <FieldError>{customCodeError}</FieldError>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="access-code-confirm">
                        Confirm access code
                      </Label>
                      <SecretInput
                        id="access-code-confirm"
                        label="access code"
                        autoComplete="new-password"
                        value={confirmCode}
                        visible={showCustomCode}
                        onToggle={() => setShowCustomCode((prev) => !prev)}
                        disabled={mutation.isPending}
                        invalid={!!confirmCodeError}
                        onChange={(value) => {
                          setConfirmCode(value);
                          if (confirmCodeError) setConfirmCodeError(undefined);
                        }}
                      />
                      <FieldError>{confirmCodeError}</FieldError>
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="access-code-current-password">
                    Current password
                  </Label>
                  <SecretInput
                    id="access-code-current-password"
                    label="password"
                    autoComplete="current-password"
                    value={password}
                    visible={showPassword}
                    onToggle={() => setShowPassword((prev) => !prev)}
                    disabled={mutation.isPending}
                    invalid={!!passwordError}
                    onChange={(value) => {
                      setPassword(value);
                      if (passwordError) setPasswordError(undefined);
                    }}
                  />
                  <FieldError>{passwordError}</FieldError>
                </div>
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
                    {mutation.isPending
                      ? isCustom
                        ? "Saving…"
                        : "Generating…"
                      : isCustom
                        ? "Save Access Code"
                        : "Generate Code"}
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
