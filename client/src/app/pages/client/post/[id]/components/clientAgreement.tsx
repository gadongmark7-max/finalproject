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
import { errorAlert } from "@/app/utils/alert"

export function ClientAgreementModal({
  callBack,
  isDisabled,
  down
}: {
  callBack: () => void
  isDisabled: boolean
  down : number
}) {
  const [open, setOpen] = useState(false)



  const [health, setHealth] = useState({
    pregnant: false,
    medicalCondition: false,
    bloodThinner: false,
    skinCondition: false,
  })

  const [consent, setConsent] = useState({
    infoTrue: false,
    understandRisk: false,
    agreeProceed: false,
  })

  const validate = () => {
    const hasHealthIssue =
      health.pregnant &&
      health.medicalCondition &&
      health.bloodThinner &&
      health.skinCondition

    const consentAccepted =
      consent.infoTrue &&
      consent.understandRisk &&
      consent.agreeProceed

    return hasHealthIssue && consentAccepted
  }

  const submitForm = () => {
    if (!validate()) {
      errorAlert("Some required conditions were not met. Please consult the artist before proceeding.");
      return
    }

    setOpen(false)
    callBack()
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          disabled={isDisabled}
          className="w-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] px-5 py-3 border border-gold text-gold hover:bg-gold hover:text-primary transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gold"
        >
          Confirm Booking
        </button>
      </DialogTrigger>

      <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription>   
           
          </DialogDescription>
        </DialogHeader>

  
      <DialogContent className="sm:max-w-[440px] bg-primary border border-border p-0 gap-0 overflow-hidden">
  
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
            Health & Consent
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
  
          {/* Health Declaration */}
          <div className="space-y-3">
            <p className="text-[9px] uppercase tracking-[0.28em] text-gold">
              Health Declaration
            </p>
            <div className="space-y-2">
              {[
                { key: "pregnant",        label: "I am NOT pregnant or breastfeeding" },
                { key: "medicalCondition",label: "I do NOT have serious medical conditions" },
                { key: "bloodThinner",    label: "I am NOT taking blood-thinning medication" },
                { key: "skinCondition",   label: "I do NOT have severe skin conditions" },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 px-4 py-3 border border-border bg-surface hover:border-border-gold transition-all duration-200 cursor-pointer group"
                >
                  <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                    (health as any)[key] ? "border-gold bg-gold" : "border-border group-hover:border-gold"
                  }`}>
                    {(health as any)[key] && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 4l2 2 4-4" stroke="#000" strokeWidth="1.5" strokeLinecap="square"/>
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={(health as any)[key]}
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
              {[
                { key: "infoTrue",      label: "I confirm that the information is true and correct" },
                { key: "understandRisk",label: "I understand the risks of tattooing" },
                { key: "agreeProceed",  label: "I agree to proceed at my own responsibility" },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 px-4 py-3 border border-border bg-surface hover:border-border-gold transition-all duration-200 cursor-pointer group"
                >
                  <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                    (consent as any)[key] ? "border-gold bg-gold" : "border-border group-hover:border-gold"
                  }`}>
                    {(consent as any)[key] && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 4l2 2 4-4" stroke="#000" strokeWidth="1.5" strokeLinecap="square"/>
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={(consent as any)[key]}
                    onChange={(e) => setConsent({ ...consent, [key]: e.target.checked })}
                  />
                  <span className="text-[11px] text-text-muted tracking-wide leading-relaxed">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
  
        </div>
  
        {/* Footer */}
        <div className="relative z-10 px-6 py-4 border-t border-border">
          <button
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
