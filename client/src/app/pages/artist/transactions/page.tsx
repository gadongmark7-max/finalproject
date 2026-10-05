"use client";

import axiosInstance from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Eye, Receipt } from "lucide-react";
import {
  formatRefundDate,
  isRefundedPayment,
  isRefundRecord,
  transactionReceiptInterface,
} from "@/app/types/transaction.type";
import { PAYMENT_METHOD_LABELS } from "@/lib/validation/schemas/booking";
import useUserStore from "@/app/store/useUserStore";
import Link from "next/link";
import { DownloadReceiptButton } from "@/components/ui/transaction-receipt";

export default function Page() {

  const {user} = useUserStore()

  const { data: transactionsData } = useQuery({
    queryKey: ["transactions_receiver", user?._id],
    enabled: !!user?._id,
    queryFn: async (): Promise<transactionReceiptInterface[]> => {
      const response = await axiosInstance.get(`/account/transaction/receiver/${user?._id}`);
      return response.data;
    },
  });

  return (
    <div className="w-full min-h-dvh bg-primary overflow-auto">

      {/* Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient Gold Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16 space-y-10">

        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
              Finance
            </span>
          </div>
          <h1
            className="text-5xl font-light text-text tracking-[-0.02em]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Payment History
          </h1>
        </div>

        {/* Transaction List */}
        {transactionsData && transactionsData.length > 0 && (
          <div className="space-y-3">
            {transactionsData.map((tx) => {
              const isRefund = isRefundRecord(tx);
              const isRefunded = isRefundedPayment(tx);
              const client = isRefund ? tx.receiver : tx.sender;
              const refundDate = formatRefundDate(tx.refundedAt);
              const method =
                PAYMENT_METHOD_LABELS[
                  tx.paymentMethod ?? tx.bookingId?.paymentMethod ?? "online"
                ];
              return (
                <div
                  key={tx._id}
                  className="relative bg-surface border border-border group transition-all duration-500 hover:border-border-gold flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4"
                >
                  {/* Gold bottom line reveal */}
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

                  {/* Left — Avatar + Info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative flex-shrink-0">
                      <img
                        src={client?.profile}
                        alt={client?.name ?? "Client"}
                        width={44}
                        height={44}
                        className="w-11 h-11 object-cover border border-border"
                      />
                      <div className="absolute -bottom-px -right-px w-2.5 h-2.5 bg-gold opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p
                          className="text-text text-sm font-light truncate"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {isRefund ? "Refunded To" : "Sent By"}
                          <span className="font-medium">
                            {" "}
                            {client?.name ?? "Unknown client"}
                          </span>
                        </p>
                        {(isRefund || isRefunded) && (
                          <span className="text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 border border-danger-border bg-danger-muted text-danger-light">
                            Refunded
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-text-muted truncate">
                        Ref: {tx.refId}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-text-muted">
                        {tx.date} · {tx.time}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-text-muted">
                        {isRefund ? `Original payment: ${method}` : method}
                        {!isRefund &&
                          tx.bookingId &&
                          ` · Session ${tx.bookingId.session ?? 1}`}
                      </p>
                      {tx.bookingId && (
                        <p className="text-[10px] uppercase tracking-[0.15em] text-text-muted truncate">
                          Booking: {tx.bookingId._id}
                        </p>
                      )}
                      {isRefunded && refundDate && (
                        <p className="text-[10px] uppercase tracking-[0.15em] text-danger-light">
                          Refunded on {refundDate}
                        </p>
                      )}
                      {(isRefund || isRefunded) && (
                        <p className="text-[10px] tracking-[0.05em] text-text-dim">
                          Not counted as earned revenue
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right — Amount + Download */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                      {isRefund ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-danger-light" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-gold" />
                      )}
                      <p
                        className={`text-lg font-light ${
                          isRefund
                            ? "text-danger-light"
                            : isRefunded
                              ? "text-text-muted line-through"
                              : "text-gold"
                        }`}
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {isRefund && "-"}₱{tx.amount.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/receipts/transaction/${tx._id}`}
                        className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-text-muted hover:text-gold border border-border hover:border-border-gold px-2.5 py-1.5 transition-all duration-300"
                        title="View Receipt"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Link>
                      <DownloadReceiptButton transaction={tx} viewer="artist" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!transactionsData?.length && (
          <div className="relative border border-border bg-surface p-16 text-center">
            <div className="pointer-events-none absolute top-0 left-0 w-12 h-12 border-t border-l border-gold opacity-40" />
            <div className="pointer-events-none absolute top-0 right-0 w-12 h-12 border-t border-r border-gold opacity-40" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-12 h-12 border-b border-l border-gold opacity-40" />
            <div className="pointer-events-none absolute bottom-0 right-0 w-12 h-12 border-b border-r border-gold opacity-40" />
            <Receipt className="w-8 h-8 text-gold opacity-30 mx-auto mb-4" />
            <p
              className="text-4xl font-light text-text-dim mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              No transactions yet
            </p>
            <p className="text-text-muted text-sm">Your payment history will appear here</p>
          </div>
        )}

      </div>
    </div>
  );

}
