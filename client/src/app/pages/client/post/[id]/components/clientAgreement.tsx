"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { X } from "lucide-react"
import { errorAlert } from "@/app/utils/alert"
import { FieldError } from "@/components/ui/field-error"
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  paymentMethodSchema,
  type PaymentMethod,
} from "@/lib/validation/schemas/booking"

const HEALTH_ITEMS = [
  { key: "pregnant",         label: "I am NOT pregnant or breastfeeding" },
  { key: "medicalCondition", label: "I do NOT have serious medical conditions" },
  { key: "bloodThinner",     label: "I am NOT taking blood-thinning medication" },
  { key: "skinCondition",    label: "I do NOT have severe skin conditions" },
] as const

const CONSENT_ITEMS = [
  { key: "infoTrue",       label: "I confirm that the information is true and correct" },
  { key: "understandRisk", label: "I understand the risks of tattooing" },
  { key: "agreeProceed",   label: "I agree to proceed at my own responsibility" },
] as const

const EMPTY_HEALTH = { pregnant: false, medicalCondition: false, bloodThinner: false, skinCondition: false }
const EMPTY_CONSENT = { infoTrue: false, understandRisk: false, agreeProceed: false }

export function ClientAgreementModal({
  callBack,
  isDisabled,
  down
}: {
  callBack: (paymentMethod: PaymentMethod) => void
  isDisabled: boolean
  down : number
}) {
  const [open, setOpen] = useState(false)
  const [triedSubmit, setTriedSubmit] = useState(false)

  const [health, setHealth] = useState({ ...EMPTY_HEALTH })
  const [consent, setConsent] = useState({ ...EMPTY_CONSENT })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("")

  const allChecked =
    HEALTH_ITEMS.every(({ key }) => health[key]) &&
    CONSENT_ITEMS.every(({ key }) => consent[key])

  const paymentMethodError = triedSubmit
    ? paymentMethodSchema.safeParse(paymentMethod).success
      ? undefined
      : "Please select a payment method."
    : undefined

  const showError = triedSubmit && !allChecked

  const setAll = (value: boolean) => {
    setHealth({ pregnant: value, medicalCondition: value, bloodThinner: value, skinCondition: value })
    setConsent({ infoTrue: value, understandRisk: value, agreeProceed: value })
  }

  const closeDialog = () => {
    setOpen(false)
    setTriedSubmit(false)
  }

  const submitForm = () => {
    const parsedMethod = paymentMethodSchema.safeParse(paymentMethod)
    if (!allChecked || !parsedMethod.success) {
      setTriedSubmit(true)
      errorAlert(
        !parsedMethod.success
          ? "Please select a payment method."
          : "Please review and check all required health and consent items before continuing."
      )
      return
    }
    setOpen(false)
    setTriedSubmit(false)
    callBack(parsedMethod.data)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setTriedSubmit(false)
      }}
    >
      <DialogTrigger asChild>
        <button
          disabled={isDisabled}
          className="w-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] px-5 py-3 border border-gold text-gold hover:bg-gold hover:text-primary transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gold"
        >
          Confirm Booking
        </button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[440px] bg-primary border border-border p-0 gap-0 overflow-hidden"
      >
        <DialogTitle className="sr-only">Health &amp; Consent</DialogTitle>
        <DialogDescription className="sr-only">
          Review and confirm all health and consent items before proceeding with the booking.
        </DialogDescription>

        {/* Grain overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Corner accents */}
        <div className="pointer-events-none absolute top-0 left-0 w-10 h-10 border-t border-l border-gold opacity-50 z-10" />
        <div className="pointer-events-none absolute top-0 right-0 w-10 h-10 border-t border-r border-gold opacity-50 z-10" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-10 h-10 border-b border-l border-gold opacity-50 z-10" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-10 h-10 border-b border-r border-gold opacity-50 z-10" />

        {/* Close button */}
        <button
          type="button"
          onClick={closeDialog}
          aria-label="Close"
          className="absolute top-3 right-3 z-30 flex items-center justify-center w-7 h-7 border border-border bg-surface-alt text-text-muted hover:text-gold hover:border-gold/50 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gold/30"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Header */}
        <div className="relative z-10 px-6 pt-6 pb-5 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px w-6 bg-gold" />
            <span className="text-[9px] uppercase tracking-[0.28em] text-gold">Review</span>
          </div>
          <h2
            className="text-2xl font-light text-text"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Health &amp; Consent
          </h2>
          <p className="text-[11px] text-text-muted mt-1 tracking-wide">
            Please review and confirm before proceeding.
          </p>
        </div>

        {/* Body */}
        <div className="relative z-10 px-6 py-5 space-y-6 max-h-[60vh] overflow-auto">

          {/* Down Payment */}
          <div className="relative border border-border bg-surface px-4 py-4">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gold opacity-60" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gold opacity-60" />
            <p className="text-[9px] uppercase tracking-[0.28em] text-gold mb-2">Down Payment</p>
            <p className="text-sm text-text-muted leading-relaxed">
              A{" "}
              <span
                className="text-gold text-base font-light"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {down}%
              </span>{" "}
              down payment is required to confirm this booking.
            </p>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <p className="text-[9px] uppercase tracking-[0.28em] text-gold">
              Payment Method
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method}
                  className={`flex items-center gap-3 px-4 py-3 border bg-surface hover:border-border-gold transition-all duration-200 cursor-pointer group ${
                    paymentMethodError ? "border-danger" : "border-border"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                    paymentMethod === method ? "border-gold" : "border-border group-hover:border-gold"
                  }`}>
                    {paymentMethod === method && (
                      <div className="w-2 h-2 rounded-full bg-gold" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    className="hidden"
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                  />
                  <span className="text-[11px] text-text-muted tracking-wide leading-relaxed">
                    {PAYMENT_METHOD_LABELS[method]}
                  </span>
                </label>
              ))}
            </div>
            <FieldError>{paymentMethodError}</FieldError>
          </div>

          {/* Check all */}
          <label className="flex items-center gap-3 px-4 py-3 border border-gold/40 bg-surface-alt cursor-pointer group">
            <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
              allChecked ? "border-gold bg-gold" : "border-border group-hover:border-gold"
            }`}>
              {allChecked && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 4l2 2 4-4" stroke="#000" strokeWidth="1.5" strokeLinecap="square"/>
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={allChecked}
              onChange={(e) => setAll(e.target.checked)}
            />
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold">
              Check all
            </span>
          </label>

          {/* Health Declaration */}
          <div className="space-y-3">
            <p className="text-[9px] uppercase tracking-[0.28em] text-gold">
              Health Declaration
            </p>
            <div className="space-y-2">
              {HEALTH_ITEMS.map(({ key, label }) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 px-4 py-3 border bg-surface hover:border-border-gold transition-all duration-200 cursor-pointer group ${
                    showError && !health[key] ? "border-danger" : "border-border"
                  }`}
                >
                  <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                    health[key] ? "border-gold bg-gold" : "border-border group-hover:border-gold"
                  }`}>
                    {health[key] && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 4l2 2 4-4" stroke="#000" strokeWidth="1.5" strokeLinecap="square"/>
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={health[key]}
                    onChange={(e) => setHealth({ ...health, [key]: e.target.checked })}
                  />
                  <span className="text-[11px] text-text-muted tracking-wide leading-relaxed">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Consent */}
          <div className="space-y-3">
            <p className="text-[9px] uppercase tracking-[0.28em] text-gold">
              Consent
            </p>
            <div className="space-y-2">
              {CONSENT_ITEMS.map(({ key, label }) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 px-4 py-3 border bg-surface hover:border-border-gold transition-all duration-200 cursor-pointer group ${
                    showError && !consent[key] ? "border-danger" : "border-border"
                  }`}
                >
                  <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                    consent[key] ? "border-gold bg-gold" : "border-border group-hover:border-gold"
                  }`}>
                    {consent[key] && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 4l2 2 4-4" stroke="#000" strokeWidth="1.5" strokeLinecap="square"/>
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={consent[key]}
                    onChange={(e) => setConsent({ ...consent, [key]: e.target.checked })}
                  />
                  <span className="text-[11px] text-text-muted tracking-wide leading-relaxed">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Validation error */}
          {showError && (
            <p
              role="alert"
              className="text-[11px] leading-relaxed text-danger-light tracking-wide border border-danger-border bg-danger-muted px-3 py-2"
            >
              Please review and check all required health and consent items before continuing.
            </p>
          )}

        </div>

        {/* Footer */}
        <div className="relative z-10 px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={submitForm}
            className="w-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] px-5 py-3 border border-gold text-gold hover:bg-gold hover:text-primary transition-all duration-200"
          >
            Submit Form
          </button>
        </div>

      </DialogContent>
    </Dialog>
  )
}
