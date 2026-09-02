"use client";

import axiosInstance from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Receipt} from "lucide-react";
import { transactionInterface } from "@/app/types/transaction.type";
import useUserStore from "@/app/store/useUserStore";

export default function Page() {

  const {user} = useUserStore()

  const { data: transactionsData } = useQuery({
    queryKey: ["transactions_receiver"],
    queryFn: async (): Promise<transactionInterface[]> => {
      const response = await axiosInstance.get(`/account/transaction/receiver/${user?._id}`);
      return response.data;
    },
  });

  console.log(transactionsData)

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
            {transactionsData.map((tx) => (
              <div
                key={tx._id}
                className="relative bg-surface border border-border group transition-all duration-500 hover:border-border-gold flex items-center justify-between gap-4 px-5 py-4"
              >
                {/* Gold bottom line reveal */}
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

                {/* Left — Avatar + Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={tx.sender.profile}
                      alt={tx.sender.name}
                      width={44}
                      height={44}
                      className="w-11 h-11 object-cover border border-border"
                    />
                    <div className="absolute -bottom-px -right-px w-2.5 h-2.5 bg-gold opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                  </div>

                  <div className="min-w-0">
                    <p
                      className="text-text text-sm font-light mb-1 truncate"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                        Sent By
                        <span className="font-medium">  {" "} {tx.sender.name}</span>
                        
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-text-muted truncate">
                      Ref: {tx.refId}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-text-muted">
                      {tx.date} · {tx.time}
                    </p>
                  </div>
                </div>

                {/* Right — Amount */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 text-gold" />
                  <p
                    className="text-gold text-lg font-light"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    ₱{tx.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
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


  return (
    <div className="w-full h-dvh p-4 space-y-4 overflow-auto">
      <h1 className="text-lg font-semibold">Payment History</h1>

      <div className="space-y-3">
        {transactionsData?.map((tx) => (
          <div
            key={tx._id}
            className="flex items-center justify-between border-b pb-3"
          >
            {/* Left */}
            <div className="flex items-center gap-3">
              <img
                src={tx.sender.profile}
                alt={tx.sender.name}
                width={44}
                height={44}
                className="rounded-full object-cover"
              />

              <div>
                <p className="text-sm">
                  <span className="font-medium">{tx.sender.name} {" "}</span>
                   sent money to you
                </p>
                <p className="text-xs text-gray-500">
                  ref :  {tx.refId}
                </p>
                <p className="text-xs text-gray-500">
                  {tx.date} • {tx.time}
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1 text-sm font-semibold">
              <ArrowUpRight className="w-4 h-4" />
              ₱{tx.amount.toLocaleString()}
            </div>
          </div>
        ))}

        {!transactionsData?.length && (
          <p className="text-sm text-gray-500 text-center mt-10">
            No transactions yet
          </p>
        )}
      </div>
    </div>
  );
}
