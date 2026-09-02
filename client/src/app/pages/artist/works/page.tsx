"use client";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, PenTool } from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";
import { worksInterface } from "@/app/types/works.type";
import { useState, useEffect } from "react";
import { WorkModal } from "./components/worksModal";

export default function Page() {
  const [works, setWorks] = useState<worksInterface[]>([]);

  const { data } = useQuery({
    queryKey: ["works"],
    queryFn: () => axiosInstance.get("/works"),
  });

  useEffect(() => {
    if (data?.data) setWorks(data.data);
  }, [data]);

  return (
    <div className="w-full min-h-screen bg-primary">

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      {/* Page Header */}
      <div className="bg-secondary border-b border-border px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Studio Canvas</span>
            </div>
            <h1
              className="text-4xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Tattoo Works
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Design, manage, and showcase your original tattoo compositions.
            </p>
          </div>

          <Link href={"/canva/new"}>
            <Button size="lg">
              <Plus className="w-4 h-4" />
              Add Work
            </Button>
          </Link>
        </div>
      </div>

      {/* Works Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">

        {works.length === 0 ? (
          <div className="border border-dashed border-border bg-surface flex flex-col items-center justify-center py-28 gap-4">
            <div className="bg-surface-alt border border-border p-4">
              <PenTool className="w-8 h-8 text-text-dim" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-text-muted">No works yet</p>
              <p className="text-xs text-text-dim tracking-wide">Create your first tattoo design on the canvas</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-border">
              {works.map((work, i) => (
              <div
      key={work._id}
      className="relative bg-white border p-2 flex items-center justify-center"
    >
      {/* Image */}
      <img
        src={work.screenShot}
        className="w-full h-40 object-cover"
        alt="Work"
      />

      {/* Modal trigger */}
      <div className="absolute inset-0 flex items-center justify-center">
        <WorkModal work={work} setWorks={setWorks} />
      </div>
    </div>
              ))}
            </div>

            {/* Footer label */}
            <div className="flex justify-between items-center mt-6 px-1">
              <p className="text-[10px] uppercase tracking-widest text-text-dim">
                {works.length} work{works.length !== 1 ? "s" : ""} total
              </p>
              <div className="flex items-center gap-1.5">
                <div className="h-px w-4 bg-border" />
                <span className="text-[10px] uppercase tracking-widest text-text-dim">Ink Of Baphomet Studio</span>
                <div className="h-px w-4 bg-border" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}