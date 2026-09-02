"use client";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary flex-col gap-6">

      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.07] blur-[100px] bg-gold" />

      {/* Spinning ring */}
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-none border border-border animate-spin
          border-t-gold border-r-gold/40 border-b-gold/10 border-l-gold/40" />
        <div className="absolute w-2 h-2 bg-gold opacity-80" />
      </div>

      {/* Label */}
      <div className="flex flex-col items-center gap-1">
        <p
          className="text-text-muted text-[10px] uppercase tracking-[0.4em] font-light animate-pulse"
        >
          Loading
        </p>
        <div className="h-px w-8 bg-gold opacity-40" />
      </div>

    </div>
  );
}