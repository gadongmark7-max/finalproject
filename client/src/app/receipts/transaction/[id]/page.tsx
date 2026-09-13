"use client";

import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Download, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transactionReceiptInterface } from "@/app/types/transaction.type";
import { PAYMENT_METHOD_LABELS } from "@/lib/validation/schemas/booking";
import LoadingScreen from "@/components/ui/loadingScreen";

export default function TransactionReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    data: transaction,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["transaction_receipt", id],
    queryFn: async (): Promise<transactionReceiptInterface> => {
      const response = await axiosInstance.get(
        `/account/transaction/${id}/receipt`,
      );
      return response.data;
    },
    retry: false,
  });

  if (isLoading) return <LoadingScreen />;

  if (isError || !transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary px-4 py-8">
        <div className="relative bg-secondary border border-border p-10 flex flex-col items-center text-center max-w-sm">
          <ShieldAlert className="w-10 h-10 text-danger-light mb-4" />
          <h1
            className="text-2xl font-light text-text mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Receipt Unavailable
          </h1>
          <p className="text-text-muted text-sm mb-6">
            This receipt doesn&apos;t exist or isn&apos;t associated with your
            account.
          </p>
          <button
            onClick={() => router.push("/pages/client/transactions")}
            className="w-full bg-surface border border-border hover:border-gold text-text-muted hover:text-gold py-3 px-6 flex items-center justify-center gap-2 transition-all duration-500"
          >
            <span className="text-[11px] uppercase tracking-[0.2em]">
              Back to Transactions
            </span>
          </button>
        </div>
      </div>
    );
  }

  const booking = transaction.bookingId;
  const paymentMethod = booking?.paymentMethod ?? "online";

  const baseAmount = transaction.amount;
  const tax = baseAmount * 0.14;
  const subTotal = baseAmount - tax;
  const total = baseAmount;

  const now = new Date();
  const day = now.toLocaleDateString("en-PH", { weekday: "long" });

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4 py-8 relative overflow-hidden">
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl relative z-10">
        {/* ── Summary Card ── */}
        <div className="relative bg-secondary border border-border rounded-none p-8 flex flex-col items-center text-center overflow-hidden">
          {/* Gold corner brackets */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t border-l border-gold opacity-40 pointer-events-none" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t border-r border-gold opacity-40 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b border-l border-gold opacity-40 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b border-r border-gold opacity-40 pointer-events-none" />

          <div className="relative mb-5">
            <div
              className="w-14 h-14 flex items-center justify-center border border-gold rounded-none"
              style={{ background: "rgba(201,168,76,0.08)" }}
            >
              <CheckCircle className="w-6 h-6 text-gold" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-5 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
              Transaction Record
            </span>
            <div className="h-px w-5 bg-gold" />
          </div>

          <h1
            className="text-3xl font-light tracking-[-0.02em] text-text mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Payment Receipt
          </h1>
          <p className="text-text-muted text-sm leading-relaxed mb-5 max-w-xs">
            {PAYMENT_METHOD_LABELS[paymentMethod]} · {transaction.date} at{" "}
            {transaction.time}
          </p>

          <div className="w-full border-t border-border mb-5" />

          <p className="text-[10px] uppercase tracking-[0.28em] text-text-muted mb-4">
            Payment Sent To
          </p>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 border border-border rounded-none overflow-hidden shrink-0">
              <img
                src={transaction.receiver.profile || "/default-avatar.png"}
                alt="Receiver"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p
                className="text-lg font-light tracking-wide text-text"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {transaction.receiver.name}
              </p>
              <p className="text-[11px] text-text-dim uppercase tracking-widest mt-0.5">
                {transaction.receiver.type === "artist"
                  ? "Tattoo Artist"
                  : "Studio Partner"}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/pages/client/transactions")}
            className="w-full bg-surface border border-border hover:border-gold text-text-muted hover:text-gold py-3 px-6 flex items-center justify-center gap-2 transition-all duration-500 group/btn"
          >
            <span className="text-[11px] uppercase tracking-[0.2em]">
              Back to Transactions
            </span>
            <ArrowRight
              size={13}
              className="transition-transform duration-300 group-hover/btn:translate-x-1"
            />
          </button>
        </div>

        {/* ── Receipt Card (paper style, matches existing receipt pages) ── */}
        <div
          className="bg-[#fafafa] p-8 rounded-sm border border-gray-300 font-mono text-sm shadow-sm relative"
          id="receipt"
        >
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="absolute top-5 right-5"
          >
            <Download />
          </Button>

          <div className="text-center mb-6">
            <h2 className="text-lg font-bold tracking-widest">
              PAYMENT RECEIPT
            </h2>
            <p className="text-gray-500 text-xs mt-1">Tattoo Booking System</p>
          </div>

          <div className="mb-4 text-gray-700">
            <div className="flex justify-between">
              <span>Date</span>
              <span>{transaction.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Day</span>
              <span>{day}</span>
            </div>
            <div className="flex justify-between">
              <span>Time</span>
              <span>{transaction.time}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-4" />

          <div className="space-y-2 text-gray-800">
            <div className="flex justify-between">
              <span>Reference No.</span>
              <span>{transaction.refId}</span>
            </div>
            {booking && (
              <div className="flex justify-between">
                <span>Booking ID</span>
                <span>{booking._id}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Paid To</span>
              <span>{transaction.receiver.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method</span>
              <span>{PAYMENT_METHOD_LABELS[paymentMethod]}</span>
            </div>
            {booking && (
              <div className="flex justify-between">
                <span>Remaining Balance</span>
                <span>
                  {booking.balance > 0
                    ? `₱${booking.balance.toLocaleString()}`
                    : "Fully Paid"}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-gray-400 my-4" />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₱{subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (14%)</span>
              <span>₱{tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-4" />

          <div className="flex justify-between font-bold text-base">
            <span>TOTAL PAID</span>
            <span>₱{total.toFixed(2)}</span>
          </div>

          <div className="border-t border-dashed border-gray-400 my-4" />

          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>This serves as an official receipt</p>
            <p>No refunds after confirmation</p>
            <p className="tracking-widest mt-2">*** THANK YOU ***</p>
          </div>
        </div>
      </div>
    </div>
  );
}
