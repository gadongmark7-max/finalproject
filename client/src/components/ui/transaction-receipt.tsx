"use client";

import { ReactNode, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { Download, LoaderCircle } from "lucide-react";
import {
  formatRefundDate,
  isRefundedPayment,
  isRefundRecord,
  transactionReceiptInterface,
} from "@/app/types/transaction.type";
import { PAYMENT_METHOD_LABELS } from "@/lib/validation/schemas/booking";
import { downloadReceiptPdf } from "@/app/utils/downloadReceipt";
import { errorAlert } from "@/app/utils/alert";

export type ReceiptViewer = "client" | "artist";

const peso = (value: number) =>
  `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const weekday = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-PH", { weekday: "long" });
};

const Row = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex justify-between gap-4">
    <span className="shrink-0">{label}</span>
    <span className="text-right break-all">{value}</span>
  </div>
);

export function receiptFileName(transaction: transactionReceiptInterface) {
  const prefix = isRefundRecord(transaction) ? "refund-receipt" : "receipt";
  return `${prefix}-${transaction.refId || transaction._id}.pdf`;
}

export function TransactionReceiptPaper({
  transaction,
  viewer,
  elementId = "receipt",
  action,
}: {
  transaction: transactionReceiptInterface;
  viewer: ReceiptViewer;
  elementId?: string;
  action?: ReactNode;
}) {
  const booking = transaction.bookingId;
  const paymentMethod =
    transaction.paymentMethod ?? booking?.paymentMethod ?? "online";
  const isRefund = isRefundRecord(transaction);
  const isRefunded = isRefundedPayment(transaction);
  const refundDate = formatRefundDate(transaction.refundedAt);

  const amount = Number(transaction.amount || 0);
  const tax = amount * 0.14;
  const subTotal = amount - tax;

  return (
    <div
      className="bg-[#fafafa] p-8 rounded-sm border border-gray-300 font-mono text-sm text-gray-900 shadow-sm relative"
      id={elementId}
    >
      {action && (
        <div
          className="absolute top-5 right-5 print:hidden"
          data-pdf-ignore="true"
        >
          {action}
        </div>
      )}

      <div className="text-center mb-6">
        <h2 className="text-lg font-bold tracking-widest">
          {isRefund ? "REFUND RECEIPT" : "PAYMENT RECEIPT"}
        </h2>
        <p className="text-gray-500 text-xs mt-1">Tattoo Booking System</p>
        {isRefunded && (
          <p className="mt-2 inline-block border border-red-400 text-red-600 text-[11px] font-bold tracking-widest px-2 py-0.5">
            REFUNDED
          </p>
        )}
      </div>

      <div className="mb-4 text-gray-700">
        <Row label="Date" value={transaction.date} />
        <Row label="Day" value={weekday(transaction.date)} />
        <Row label="Time" value={transaction.time} />
      </div>

      <div className="border-t border-dashed border-gray-400 my-4" />

      <div className="space-y-2 text-gray-800">
        <Row label="Reference No." value={transaction.refId} />
        {booking && <Row label="Booking ID" value={booking._id} />}
        {isRefund ? (
          <>
            <Row label="Refunded To" value={transaction.receiver?.name ?? "—"} />
            <Row label="Refunded By" value={transaction.sender?.name ?? "—"} />
            <Row
              label="Original Payment"
              value={PAYMENT_METHOD_LABELS[paymentMethod]}
            />
          </>
        ) : (
          <>
            {viewer === "artist" ? (
              <Row label="Paid By" value={transaction.sender?.name ?? "—"} />
            ) : (
              <Row label="Paid To" value={transaction.receiver?.name ?? "—"} />
            )}
            <Row
              label="Payment Method"
              value={PAYMENT_METHOD_LABELS[paymentMethod]}
            />
            {booking?.session && (
              <Row label="Session" value={String(booking.session)} />
            )}
            <Row label="Status" value={isRefunded ? "Refunded" : "Paid"} />
            {isRefunded && refundDate && (
              <Row label="Refunded On" value={refundDate} />
            )}
            {booking && !isRefunded && (
              <Row
                label="Remaining Balance"
                value={
                  booking.balance > 0
                    ? `₱${booking.balance.toLocaleString()}`
                    : "Fully Paid"
                }
              />
            )}
          </>
        )}
      </div>

      <div className="border-t border-dashed border-gray-400 my-4" />

      {isRefund ? (
        <div className="flex justify-between font-bold text-base">
          <span>TOTAL REFUNDED</span>
          <span>{peso(amount)}</span>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Row label="Subtotal" value={`₱${subTotal.toFixed(2)}`} />
            <Row label="Tax (14%)" value={`₱${tax.toFixed(2)}`} />
          </div>

          <div className="border-t border-dashed border-gray-400 my-4" />

          <div className="flex justify-between font-bold text-base">
            <span>TOTAL PAID</span>
            <span>₱{amount.toFixed(2)}</span>
          </div>
          {isRefunded && (
            <div className="flex justify-between font-bold text-base text-red-600 mt-2">
              <span>AMOUNT REFUNDED</span>
              <span>-₱{amount.toFixed(2)}</span>
            </div>
          )}
        </>
      )}

      <div className="border-t border-dashed border-gray-400 my-4" />

      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>
          {isRefund
            ? "This serves as an official refund receipt"
            : isRefunded
              ? "This payment has been refunded to the client"
              : "This serves as an official receipt"}
        </p>
        <p className="tracking-widest mt-2">*** THANK YOU ***</p>
      </div>
    </div>
  );
}

export function DownloadReceiptButton({
  transaction,
  viewer,
  className = "",
}: {
  transaction: transactionReceiptInterface;
  viewer: ReceiptViewer;
  className?: string;
}) {
  const [isRendering, setIsRendering] = useState(false);
  const elementId = `receipt-${transaction._id}`;

  const handleDownload = async () => {
    if (isRendering) return;
    flushSync(() => setIsRendering(true));
    try {
      await downloadReceiptPdf(elementId, receiptFileName(transaction));
    } catch (e) {
      console.error(e);
      errorAlert("Failed to download receipt");
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleDownload}
        disabled={isRendering}
        title="Download Receipt"
        aria-label={`Download receipt ${transaction.refId}`}
        className={`flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-text-muted hover:text-gold border border-border hover:border-border-gold px-2.5 py-1.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait whitespace-nowrap ${className}`}
      >
        {isRendering ? (
          <LoaderCircle className="w-3 h-3 animate-spin" />
        ) : (
          <Download className="w-3 h-3" />
        )}
        {isRendering ? "Preparing…" : "Download Receipt"}
      </button>
      {isRendering &&
        createPortal(
          <div
            aria-hidden="true"
            style={{
              position: "fixed",
              left: -10000,
              top: 0,
              width: 440,
              pointerEvents: "none",
            }}
          >
            <TransactionReceiptPaper
              transaction={transaction}
              viewer={viewer}
              elementId={elementId}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
