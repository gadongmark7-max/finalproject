"use client"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck, Ban, HeartPulse, Clock, Droplet, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function TattooClientGuidePage() {
  return (
    <div className="min-h-screen bg-primary text-text px-6 py-12 mt-20">

              <div className="flex items-center gap-2 absolute top-2 left-2  ">
                <Link href={"/"} className="flex h-17 w-34 items-center justify-center rounded-lg hover:scale-95">
                  <img src="/web/logo.jpg" alt="Tattoo design 1" className="h-full w-full rounded-lg" />
                </Link>
        </div>

      {/* Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />
      {/* Ambient Gold Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-8 bg-gold opacity-60" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Client Resources</span>
        </div>
        <h1
          className="text-5xl font-light tracking-[-0.02em] text-text mb-5"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Tattoo Client Guide
        </h1>
        <p className="text-text-muted text-base max-w-3xl leading-relaxed">
          Essential information every tattoo client should know — before, during, and after getting tattooed.
          Proper care helps your tattoo heal faster, look better, and stay infection-free.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid gap-5">

        {/* Before Your Appointment */}
        <div className="group relative bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden">
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
          <div className="p-8">
            <div className="flex flex-row items-center gap-4 mb-5">
              <div className="bg-surface-alt border border-border group-hover:border-border-gold p-2.5 transition-all duration-300">
                <Clock className="w-5 h-5 text-gold" />
              </div>
              <h2
                className="text-2xl font-light tracking-[-0.02em] text-text"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Before Your Appointment
              </h2>
            </div>
            <div className="space-y-2 text-text-muted text-sm leading-relaxed">
              <p><span className="text-gold font-light">—</span> Get a good night's sleep and eat a proper meal before your session.</p>
              <p><span className="text-gold font-light">—</span> Stay hydrated in the days leading up to your appointment.</p>
              <p><span className="text-gold font-light">—</span> Avoid alcohol and blood-thinning medications for 24 hours prior.</p>
              <p><span className="text-gold font-light">—</span> Wear comfortable clothing that provides easy access to the tattoo area.</p>
              <p><span className="text-gold font-light">—</span> Bring a valid ID and any reference images if needed.</p>
            </div>
          </div>
        </div>

        {/* Healing Stages */}
        <div className="group relative bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden">
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
          <div className="p-8">
            <div className="flex flex-row items-center gap-4 mb-5">
              <div className="bg-surface-alt border border-border group-hover:border-border-gold p-2.5 transition-all duration-300">
                <Droplet className="w-5 h-5 text-gold" />
              </div>
              <h2
                className="text-2xl font-light tracking-[-0.02em] text-text"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Tattoo Healing Stages
              </h2>
            </div>
            <div className="space-y-2 text-text-muted text-sm leading-relaxed">
              <p><span className="text-gold font-light">Days 1–3 —</span> Redness, swelling, and soreness are normal. Treat like a wound.</p>
              <p><span className="text-gold font-light">Days 4–14 —</span> Peeling, itching, and flaking will occur. Do not scratch.</p>
              <p><span className="text-gold font-light">Weeks 3–6 —</span> Skin looks healed but continues repairing underneath.</p>
              <p><span className="text-gold font-light">Full healing —</span> Complete healing can take 3–6 months depending on size and placement.</p>
            </div>
            <div className="mt-4">
              <Badge variant="outline">Healing time varies per person</Badge>
            </div>
          </div>
        </div>

        {/* Proper Aftercare */}
        <div className="group relative bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden">
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
          <div className="p-8">
            <div className="flex flex-row items-center gap-4 mb-5">
              <div className="bg-surface-alt border border-border group-hover:border-border-gold p-2.5 transition-all duration-300">
                <HeartPulse className="w-5 h-5 text-gold" />
              </div>
              <h2
                className="text-2xl font-light tracking-[-0.02em] text-text"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Proper Aftercare
              </h2>
            </div>
            <div className="space-y-2 text-text-muted text-sm leading-relaxed">
              <p><span className="text-gold font-light">—</span> Remove bandage after 2–4 hours (or as instructed by your artist).</p>
              <p><span className="text-gold font-light">—</span> Wash gently with lukewarm water and fragrance-free, antibacterial soap.</p>
              <p><span className="text-gold font-light">—</span> Pat dry with a clean paper towel — avoid rubbing.</p>
              <p><span className="text-gold font-light">—</span> Apply a thin layer of recommended ointment (Aquaphor, Hustle Butter, or artist's choice).</p>
              <p><span className="text-gold font-light">—</span> Moisturize 2–3 times daily, but don't over-apply.</p>
              <p><span className="text-gold font-light">—</span> Keep tattoo clean and avoid tight or dirty clothing.</p>
              <p><span className="text-gold font-light">—</span> Wear loose, breathable fabrics during the healing process.</p>
            </div>
          </div>
        </div>

        {/* What NOT to Do */}
        <div className="group relative bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden">
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
          <div className="p-8">
            <div className="flex flex-row items-center gap-4 mb-5">
              <div className="bg-surface-alt border border-border group-hover:border-border-gold p-2.5 transition-all duration-300">
                <Ban className="w-5 h-5 text-gold" />
              </div>
              <h2
                className="text-2xl font-light tracking-[-0.02em] text-text"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                What You Should NOT Do
              </h2>
            </div>
            <div className="space-y-2 text-text-muted text-sm leading-relaxed">
              <p><span className="text-danger-light font-light">—</span> Do NOT scratch, pick, or peel the tattoo under any circumstances.</p>
              <p><span className="text-danger-light font-light">—</span> Avoid swimming pools, hot tubs, beaches, and soaking for at least 2–3 weeks.</p>
              <p><span className="text-danger-light font-light">—</span> Do NOT expose to direct sunlight — UV rays will fade your tattoo.</p>
              <p><span className="text-danger-light font-light">—</span> Avoid alcohol and excessive sweating during the first week.</p>
              <p><span className="text-danger-light font-light">—</span> Do NOT use petroleum jelly, Vaseline, or scented lotions.</p>
              <p><span className="text-danger-light font-light">—</span> Avoid tight clothing or anything that rubs against the tattoo.</p>
              <p><span className="text-danger-light font-light">—</span> Do NOT shave over the tattooed area until fully healed.</p>
            </div>
          </div>
        </div>

        {/* Infection Prevention */}
        <div className="group relative bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden">
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
          <div className="p-8">
            <div className="flex flex-row items-center gap-4 mb-5">
              <div className="bg-surface-alt border border-border group-hover:border-border-gold p-2.5 transition-all duration-300">
                <ShieldCheck className="w-5 h-5 text-gold" />
              </div>
              <h2
                className="text-2xl font-light tracking-[-0.02em] text-text"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Preventing Infections
              </h2>
            </div>
            <div className="space-y-2 text-text-muted text-sm leading-relaxed">
              <p><span className="text-gold font-light">—</span> Always wash your hands thoroughly before touching your tattoo.</p>
              <p><span className="text-gold font-light">—</span> Use only clean towels, bedding, and clothing.</p>
              <p><span className="text-gold font-light">—</span> Avoid contact with pets, dirt, and unsanitary surfaces.</p>
              <p><span className="text-gold font-light">—</span> Never let anyone else touch your fresh tattoo.</p>
              <p><span className="text-gold font-light">—</span> Do not share ointments, towels, or touch others' healing tattoos.</p>
              <p><span className="text-gold font-light">—</span> Follow your artist's aftercare instructions strictly — they know best.</p>
              <p><span className="text-gold font-light">—</span> Keep your environment clean, especially where you sleep.</p>
            </div>
          </div>
        </div>

        {/* Warning Signs — CTA card with corner brackets */}
        <div className="group relative bg-danger-muted border border-danger-border hover:border-danger transition-all duration-500 overflow-hidden">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-danger opacity-40" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-danger opacity-40" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-danger opacity-40" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-danger opacity-40" />
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-danger-light group-hover:w-full transition-all duration-700" />

          <div className="p-8">
            <div className="flex flex-row items-center gap-4 mb-5">
              <div className="bg-danger-muted border border-danger-border p-2.5">
                <AlertTriangle className="w-5 h-5 text-danger-light" />
              </div>
              <h2
                className="text-2xl font-light tracking-[-0.02em] text-danger-light"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Warning Signs of Infection
              </h2>
            </div>
            <div className="space-y-2 text-danger-light/70 text-sm leading-relaxed">
              <p><span className="text-danger-light font-light">—</span> Excessive swelling or redness that worsens after several days</p>
              <p><span className="text-danger-light font-light">—</span> Yellow, green, or foul-smelling discharge</p>
              <p><span className="text-danger-light font-light">—</span> Red streaks radiating from the tattoo</p>
              <p><span className="text-danger-light font-light">—</span> Fever, chills, or severe pain that doesn't subside</p>
              <p><span className="text-danger-light font-light">—</span> Unusual warmth or heat coming from the tattooed area</p>
            </div>
            <Separator className="my-5 bg-danger-border" />
            <p className="text-danger-light text-[10px] uppercase tracking-[0.2em] font-light">
              If any of these symptoms appear, consult a medical professional immediately. Do not wait.
            </p>
          </div>
        </div>

        {/* Long-Term Care */}
        <div className="group relative bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden">
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
          <div className="p-8">
            <div className="flex flex-row items-center gap-4 mb-5">
              <div className="bg-surface-alt border border-border group-hover:border-border-gold p-2.5 transition-all duration-300">
                <HeartPulse className="w-5 h-5 text-gold" />
              </div>
              <h2
                className="text-2xl font-light tracking-[-0.02em] text-text"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Long-Term Tattoo Care
              </h2>
            </div>
            <div className="space-y-2 text-text-muted text-sm leading-relaxed">
              <p><span className="text-gold font-light">—</span> Always apply SPF 50+ sunscreen when exposed to sunlight.</p>
              <p><span className="text-gold font-light">—</span> Moisturize regularly to keep skin and ink vibrant.</p>
              <p><span className="text-gold font-light">—</span> Stay hydrated and maintain healthy skin overall.</p>
              <p><span className="text-gold font-light">—</span> Touch-ups may be needed every few years depending on placement and sun exposure.</p>
              <p><span className="text-gold font-light">—</span> Avoid extreme weight fluctuations that can distort the tattoo.</p>
            </div>
          </div>
        </div>

        {/* Final Tip */}
        <div className="text-center py-12 border-t border-border mt-2">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10 bg-gold opacity-40" />
            <div className="w-1 h-1 bg-gold opacity-60" />
            <div className="h-px w-10 bg-gold opacity-40" />
          </div>
          <p
            className="text-text-muted text-base max-w-2xl mx-auto leading-relaxed italic"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            A tattoo is a lifelong commitment. Proper care ensures it stays bold, clean, and beautiful for years to come.
            Trust your artist, follow their advice, and enjoy your new art.
          </p>
        </div>

      </div>
    </div>
  )
}