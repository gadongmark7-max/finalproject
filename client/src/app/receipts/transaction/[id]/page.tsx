"use client";

import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Download, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transactionReceiptInterface } from "@/app/types/transaction.type";
import { PAYMENT_METHOD_LABELS } from "@/lib/validation/schemas/booking";
import LoadingScreen from "@/components/ui/loadingScreen";
import { useState } from "react";
import { downloadReceiptPdf } from "@/app/utils/downloadReceipt";
import { errorAlert } from "@/app/utils/alert";
import useUserStore from "@/app/store/useUserStore";
import {
  receiptFileName,
  TransactionReceiptPaper,
} from "@/components/ui/transaction-receipt";
import { isRefundRecord } from "@/app/types/transaction.type";

export default function TransactionReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useUserStore();
  const isClientViewer = !user || user.type === "client";
  const transactionsPath = isClientViewer
    ? "/pages/client/transactions"
    : "/pages/artist/transactions";

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

  const [isDownloading, setIsDownloading] = useState(false);

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
            onClick={() => router.push(transactionsPath)}
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

  const paymentMethod =
    transaction.paymentMethod ??
    transaction.bookingId?.paymentMethod ??
    "online";
  const viewer = isClientViewer ? "client" : "artist";
  const isRefund = isRefundRecord(transaction);
  const counterparty = isRefund
    ? isClientViewer
      ? transaction.sender
      : transaction.receiver
    : isClientViewer
      ? transaction.receiver
      : transaction.sender;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadReceiptPdf("receipt", receiptFileName(transaction));
    } catch (e) {
      console.error(e);
      errorAlert("Failed to download receipt");
    } finally {
      setIsDownloading(false);
    }
  };

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
            {isRefund ? "Refund Receipt" : "Payment Receipt"}
          </h1>
          <p className="text-text-muted text-sm leading-relaxed mb-5 max-w-xs">
            {PAYMENT_METHOD_LABELS[paymentMethod]} · {transaction.date} at{" "}
            {transaction.time}
          </p>

          <div className="w-full border-t border-border mb-5" />

          <p className="text-[10px] uppercase tracking-[0.28em] text-text-muted mb-4">
            {isRefund
              ? isClientViewer
                ? "Refunded By"
                : "Refunded To"
              : isClientViewer
                ? "Payment Sent To"
                : "Payment Received From"}
          </p>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 border border-border rounded-none overflow-hidden shrink-0">
              <img
                src={counterparty?.profile || "/default-avatar.png"}
                alt={counterparty?.name ?? "Account"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p
                className="text-lg font-light tracking-wide text-text"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {counterparty?.name}
              </p>
              <p className="text-[11px] text-text-dim uppercase tracking-widest mt-0.5">
                {counterparty?.type === "artist"
                  ? "Tattoo Artist"
                  : counterparty?.type === "client"
                    ? "Client"
                    : "Studio Partner"}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push(transactionsPath)}
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

        <TransactionReceiptPaper
          transaction={transaction}
          viewer={viewer}
          action={
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={isDownloading}
              title="Download Receipt"
            >
              <Download className="w-4 h-4" />
            </Button>
          }
        />
      </div>
    </div>
  );
}
