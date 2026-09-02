"use client"
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { adminMessageInterface } from "@/app/types/adminMessage.type";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Clock, Eye, FileImage, Tag, User, ArrowRight } from "lucide-react";



export default function Page() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<adminMessageInterface | null>(null);

  useEffect(() => {
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["unseen-adminMessage"] });
    }, 1000);
  }, [queryClient]);

  const { data: adminMessages, isLoading } = useQuery({
    queryKey: ["adminMessage"],
    queryFn: async (): Promise<adminMessageInterface[]> => {
      const res = await axiosInstance.get(`/account/adminMessage`);
      return res.data;
    },
  });

  if (isLoading) return (
    <div className="w-full min-h-dvh bg-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border border-gold border-t-transparent animate-spin" />
        <p className="text-[10px] uppercase tracking-[0.28em] text-text-muted">Loading Reports</p>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-dvh bg-primary relative">

      {/* Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">

        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Admin Panel</span>
          </div>
          <h1
            className="text-4xl font-light text-text tracking-[-0.02em]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Report Inbox
          </h1>
          <p className="text-text-muted text-sm mt-2 leading-relaxed">
            Review all flagged user reports. Click any entry to view full details.
          </p>
        </div>

        {/* Summary Bar */}
        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-text-muted">
              {adminMessages?.length ?? 0} Total
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-danger-light" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-text-muted">
              {adminMessages?.filter(m => !m.isSeen).length ?? 0} Unread
            </span>
          </div>
        </div>

        {/* Report List */}
        <div className="space-y-3">
          {adminMessages?.map((item, index) => (
            <div
              key={item._id}
              onClick={() => setSelected(item)}
              className="group relative bg-surface border border-border hover:border-border-gold transition-all duration-500 cursor-pointer overflow-hidden"
            >
              {/* Gold bottom line reveal */}
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

              {/* Unseen indicator */}
              {!item.isSeen && (
                <div className="absolute top-0 left-0 w-[3px] h-full bg-gold opacity-80" />
              )}

              <div className="flex items-center justify-between px-6 py-4 pl-8">

                {/* Left: Avatars + Route */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {/* Reporter Avatar */}
                    <div className="relative">
                      {item.account?.profile ? (
                        <img
                          src={item.account.profile}
                          alt={item.account.name}
                          className="w-9 h-9 object-cover border border-border"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-surface-alt border border-border flex items-center justify-center">
                          <User className="w-4 h-4 text-text-muted" />
                        </div>
                      )}
                    </div>

                    <ArrowRight className="w-3 h-3 text-text-dim flex-shrink-0" />

                    {/* Reported Avatar */}
                    <div className="relative">
                      {item.reportedAccount?.profile ? (
                        <img
                          src={item.reportedAccount.profile}
                          alt={item.reportedAccount.name}
                          className="w-9 h-9 object-cover border border-border-gold"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-surface-alt border border-border flex items-center justify-center">
                          <User className="w-4 h-4 text-text-muted" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Names */}
                  <div>
                    <p className="text-text text-sm leading-none">
                      <span className="text-text-muted">{item.account?.name}</span>
                      <span className="text-text-dim mx-1.5">→</span>
                      <span className="text-text font-light">{item.reportedAccount?.name}</span>
                    </p>
                    <p className="text-text-dim text-[10px] uppercase tracking-[0.18em] mt-1.5 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {item.type}
                    </p>
                  </div>
                </div>

                {/* Right: Status + Meta */}
                <div className="flex items-center gap-6">
                  {item.proof && (
                    <div className="flex items-center gap-1.5 text-text-dim">
                      <FileImage className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase tracking-[0.18em]">Proof</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-text-dim">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] text-text-muted">{item.date}</span>
                  </div>

                  <div className={`px-3 py-1 text-[10px] uppercase tracking-[0.18em] border ${
                    item.isSeen
                      ? "border-border text-text-dim bg-surface-alt"
                      : "border-danger-border bg-danger-muted text-danger-light"
                  }`}>
                    {item.isSeen ? "Seen" : "New"}
                  </div>

                  <Eye className="w-4 h-4 text-text-dim group-hover:text-gold transition-colors duration-300" />
                </div>
              </div>
            </div>
          ))}

          {adminMessages?.length === 0 && (
            <div className="bg-surface border border-border py-20 text-center">
              <AlertTriangle className="w-8 h-8 text-text-dim mx-auto mb-4" />
              <p className="text-[10px] uppercase tracking-[0.28em] text-text-dim">No Reports Found</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>


        <DialogContent className="max-w-2xl bg-secondary border-border rounded-none p-0 overflow-hidden">


          {/* Modal Gold corners */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-gold opacity-40 pointer-events-none" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-gold opacity-40 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-gold opacity-40 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-gold opacity-40 pointer-events-none" />

          <DialogHeader className="px-8 pt-8 pb-0">

        <DialogTitle className="flex items-center gap-3 mb-2">
           
              <div className="h-px w-6 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Report Detail</span>
         
        </DialogTitle>
          <DialogDescription className="text-2xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>   
             
             
  
          </DialogDescription>

       
        
          </DialogHeader>

          <div className="px-8 py-6 space-y-6">

            {/* Accounts Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Reporter */}
              <div className="bg-surface border border-border p-4 flex items-center gap-3">
                {selected?.account?.profile ? (
                  <img src={selected.account.profile} alt={selected.account.name} className="w-12 h-12 object-cover border border-border" />
                ) : (
                  <div className="w-12 h-12 bg-surface-alt border border-border flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-text-muted" />
                  </div>
                )}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-dim mb-1">Reporter</p>
                  <p className="text-text text-sm font-light">{selected?.account?.name}</p>
                </div>
              </div>

              {/* Reported */}
              <div className="bg-surface border border-border-gold p-4 flex items-center gap-3">
                {selected?.reportedAccount?.profile ? (
                  <img src={selected.reportedAccount.profile} alt={selected.reportedAccount.name} className="w-12 h-12 object-cover border border-gold opacity-80" />
                ) : (
                  <div className="w-12 h-12 bg-surface-alt border border-border flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-text-muted" />
                  </div>
                )}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-dim mb-1">Reported</p>
                  <p className="text-gold-light text-sm font-light">{selected?.reportedAccount?.name}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Message */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-3">Message</p>
              <p className="text-text text-sm leading-relaxed">{selected?.message}</p>
            </div>

            {/* Proof Image */}
            {selected?.proof && (
              <>
                <Separator />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-3 flex items-center gap-2">
                    <FileImage className="w-3 h-3" /> Proof Attachment
                  </p>
                  <img
                    src={selected.proof}
                    alt="proof"
                    className="w-full max-h-64 object-cover border border-border cursor-pointer hover:border-border-gold transition-colors duration-300"
                    onClick={() => window.open(selected.proof, "_blank")}
                  />
                  <p className="text-[10px] text-text-dim mt-2 tracking-[0.1em]">Click image to open in new tab</p>
                </div>
              </>
            )}

            <Separator />

            {/* Footer Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-text-dim">
                  <Clock className="w-3 h-3" />
                  <span className="text-[11px] tracking-[0.1em]">{selected?.date}</span>
                </div>
                <span className="text-text-dim text-[11px]">{selected?.time}</span>
              </div>

              <div className={`px-3 py-1 text-[10px] uppercase tracking-[0.18em] border ${
                selected?.isSeen
                  ? "border-border text-text-dim bg-surface-alt"
                  : "border-danger-border bg-danger-muted text-danger-light"
              }`}>
                {selected?.isSeen ? "Seen" : "New"}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}