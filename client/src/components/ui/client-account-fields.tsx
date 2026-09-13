"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Sparkles, Copy, Check, Loader2 } from "lucide-react";

import axiosInstance from "@/app/utils/axios";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { emailField, passwordField, firstError } from "@/lib/validation/fields";
import { generatePassword } from "@/lib/generatePassword";

interface ClientAccountFieldsProps {
  email: string;
  onChange: (state: { password?: string; blocking: boolean }) => void;
}

export function ClientAccountFields({
  email,
  onChange,
}: ClientAccountFieldsProps) {
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedEmail(email.trim().toLowerCase()),
      400,
    );
    return () => clearTimeout(t);
  }, [email]);

  const validEmail =
    !!debouncedEmail && emailField().safeParse(debouncedEmail).success;

  useEffect(() => {
    setEmailExists(null);
    if (!validEmail) return;

    let active = true;
    setCheckingEmail(true);
    axiosInstance
      .get("/account/exists", { params: { email: debouncedEmail } })
      .then((res) => {
        if (active) setEmailExists(!!res.data?.exists);
      })
      .catch(() => {
        if (active) setEmailExists(null);
      })
      .finally(() => {
        if (active) setCheckingEmail(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedEmail, validEmail]);

  const passwordError = firstError(passwordField(), password);
  const wantsAccount = validEmail && emailExists === false && createAccount;
  const blocking =
    validEmail && checkingEmail
      ? true
      : wantsAccount &&
        !!firstError(passwordField(), password, { showWhenEmpty: true });

  useEffect(() => {
    onChange({
      password: wantsAccount && password ? password : undefined,
      blocking: !!blocking,
    });
  }, [wantsAccount, password, blocking]);

  if (!validEmail) return null;

  return (
    <div className="space-y-3">
      {checkingEmail && (
        <p className="text-[10px] uppercase tracking-[0.18em] text-text-dim flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" /> Checking email...
        </p>
      )}

      {!checkingEmail && emailExists === true && (
        <p className="text-[11px] text-gold border border-border-gold bg-surface-alt px-3 py-2">
          An account with this email already exists — this booking will use that
          account.
        </p>
      )}

      {!checkingEmail && emailExists === false && (
        <div className="space-y-3 border border-border p-4 bg-surface">
          <button
            type="button"
            onClick={() => setCreateAccount((prev) => !prev)}
            className={`w-full px-4 py-2.5 border text-[10px] uppercase tracking-[0.18em] transition-all duration-300 ${
              createAccount
                ? "bg-surface-alt border-border-gold text-gold"
                : "bg-surface border-border text-text-muted hover:border-border-gold hover:text-gold"
            }`}
          >
            {createAccount ? "Skip Account Creation" : "Create Client Account"}
          </button>

          {createAccount && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.18em] text-text-muted block">
                Temporary Password
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 min-w-0">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    aria-invalid={!!passwordError}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter or generate a password"
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
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setPassword(generatePassword())}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 border border-border text-text-muted text-[10px] uppercase tracking-[0.15em] hover:border-border-gold hover:text-gold transition-all duration-300"
                    title="Generate password"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Generate
                  </button>
                  <button
                    type="button"
                    disabled={!password}
                    onClick={() => {
                      navigator.clipboard?.writeText(password);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 border border-border text-text-muted text-[10px] uppercase tracking-[0.15em] hover:border-border-gold hover:text-gold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Copy password"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <FieldError>{passwordError}</FieldError>
              <p className="text-[10px] text-text-dim leading-relaxed">
                This lets the client log in later using this email and password.
                Share it with them securely.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
