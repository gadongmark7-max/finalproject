"use client"
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { useSearchParams } from "next/navigation";
import useUserStore from "@/app/store/useUserStore";
import { payslipInterface } from "@/app/types/payroll.type";
import { ViewProof } from "./components/viewProof";
import { FileText, CheckCircle } from "lucide-react";

export default function Page() {
  const searchParams = useSearchParams();
  const business = searchParams.get("business");
  const { user } = useUserStore();

  const { data: payslips } = useQuery({
    queryKey: ['payslips', business],
    enabled: !!business && !!user?.email,
    queryFn: async (): Promise<payslipInterface[]> => {
      const response = await axiosInstance.get(
        `/account/payslip/${business}/${user?.email}`
      );
      return response.data;
    }
  });

  return (
    <div className="w-full min-h-dvh bg-primary print:bg-white">

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] print:hidden"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold print:hidden" />

      {/* Page Header */}
      <div className="bg-secondary border-b border-border px-6 lg:px-8 py-10 print:hidden">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Payroll</span>
          </div>
          <h1
            className="text-4xl font-light text-text tracking-[-0.02em]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            My Payslips
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            View your earnings, deductions, and pay history.
          </p>
        </div>
      </div>

      {/* Payslip List */}
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-10 space-y-8 print:p-0 print:space-y-6">

        {!payslips?.length && (
          <div className="border border-dashed border-border bg-surface flex flex-col items-center justify-center py-28 gap-4">
            <div className="bg-surface-alt border border-border p-4">
              <FileText className="w-8 h-8 text-text-dim" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-text-muted">No payslips found</p>
              <p className="text-xs text-text-dim tracking-wide">Your payslips will appear here once generated</p>
            </div>
          </div>
        )}

        {payslips?.map((payslip, i) => (
          <div
            key={i}
            className={`relative bg-surface border print:border print:shadow-none print:bg-white overflow-hidden group
              ${payslip.proofOfAcceptance ? "border-success-border" : "border-border"}`}
          >
            {/* Gold bottom reveal */}
            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700 print:hidden" />

            {/* Accepted stripe */}
            {payslip.proofOfAcceptance && (
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-success" />
            )}

            {/* Ghost index */}
            <span
              className="absolute top-1 right-6 text-8xl font-light text-text-dim opacity-10 select-none leading-none pointer-events-none print:hidden"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            {/* Header */}
            <div className="px-8 pt-8 pb-5 border-b border-border flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-gold opacity-60" />
                  <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Employee Payslip</span>
                </div>
                <h2
                  className="text-2xl font-light text-text tracking-[-0.02em]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {payslip.periodFrom} — {payslip.periodTo}
                </h2>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {payslip.proofOfAcceptance && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] bg-success-muted text-success-light border border-success-border">
                    <CheckCircle className="w-3 h-3" /> Received
                  </span>
                )}
                {payslip.proofOfAcceptance && <ViewProof preview={payslip.proofOfAcceptance} />}
              </div>
            </div>

            {/* Employee Info */}
            <div className="px-8 py-5 border-b border-border grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-0.5">Name</p>
                  <p className="text-sm text-text">{payslip.name}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-0.5">Role</p>
                  <p className="text-sm text-text">{payslip.role}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-0.5">Pay Type</p>
                  <p className="text-sm text-text">{payslip.payType}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-0.5">Date</p>
                  <p className="text-sm text-text">{payslip.date}</p>
                </div>
                <div className="flex justify-between"> 
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-0.5">Month</p>
                  <p className="text-sm text-text">{payslip.month}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-0.5">Attendance</p>
                  <p className="text-sm text-text">{payslip.attendance}</p>
                </div>
              </div>
            </div>

            {/* Earnings & Deductions */}
            <div className="px-8 py-6 grid grid-cols-2 gap-8">

              {/* Earnings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <div className="h-px w-3 bg-gold opacity-60" />
                  <span className="text-[10px] uppercase tracking-[0.22em] text-gold">Earnings</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-muted">Basic Pay</span>
                    <span className="text-sm text-text font-light">₱ {payslip.basicPay.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-muted">Overtime</span>
                    <span className="text-sm text-text font-light">₱ {payslip.otPay.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-muted">Commissions</span>
                    <span className="text-sm text-text font-light">₱ {payslip.commisions.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Gross Pay</span>
                  <span
                    className="text-xl font-light text-text"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    ₱ {payslip.grossPay.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Deductions & Net Pay */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <div className="h-px w-3 bg-gold opacity-60" />
                  <span className="text-[10px] uppercase tracking-[0.22em] text-gold">Deductions</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-muted">Total Deductions</span>
                    <span className="text-sm text-danger-light font-light">₱ {payslip.totalDeducstions.toFixed(2)}</span>
                  </div>
                </div>

                {/* Net Pay highlight */}
                <div className="mt-4 p-4 bg-surface-alt border border-border-gold relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-gold opacity-40" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-gold opacity-40" />
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gold mb-1">Net Pay</p>
                  <p
                    className="text-3xl font-light text-gold"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    ₱ {payslip.netPay.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer strip */}
            <div className="px-8 py-3 border-t border-border flex justify-between items-center bg-secondary print:hidden">
              <span className="text-[10px] uppercase tracking-widest text-text-dim">Ink Of Baphomet Studio</span>
              <span className="text-[10px] uppercase tracking-widest text-text-dim">
                Payslip {String(i + 1).padStart(2, "0")} of {payslips.length}
              </span>
            </div>
          </div>
        ))}

        {/* Footer count */}
        {payslips && payslips.length > 0 && (
          <div className="flex justify-between items-center px-1 print:hidden">
            <p className="text-[10px] uppercase tracking-widest text-text-dim">
              {payslips.length} payslip{payslips.length !== 1 ? "s" : ""} total
            </p>
            <div className="flex items-center gap-1.5">
              <div className="h-px w-4 bg-border" />
              <span className="text-[10px] uppercase tracking-widest text-text-dim">Ink Of Baphomet Payroll</span>
              <div className="h-px w-4 bg-border" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}