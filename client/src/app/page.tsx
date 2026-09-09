"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock, Instagram, Sun, Moon, ChevronDown, Navigation, Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { postInterface } from "@/app/types/post.type"
import { artistInfoInterface } from "@/app/types/accounts.type"
import useLightModeStore from "./store/displayModeStore"
import dynamic from "next/dynamic"
import { useZodForm } from "@/lib/validation/useZodForm"
import { consultationSchema, type ConsultationValues } from "@/lib/validation/schemas/contact"
import { FieldError } from "@/components/ui/field-error"
import { successAlert, errorAlert } from "@/app/utils/alert"

const MapWithNoSSR = dynamic(
  () => import("@/app/components/landing/ArtistMap"),
  { ssr: false, loading: () => (
    <div className="h-[420px] bg-surface-alt border border-border flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-text-dim">
        <Navigation className="w-5 h-5 animate-pulse" />
        <span className="text-[10px] uppercase tracking-[0.2em]">Loading map…</span>
      </div>
    </div>
  )}
)

export default function Page() {
  const { lightMode, setLightMode } = useLightModeStore()
  const router = useRouter()

  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false) }
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false) }
    window.addEventListener("keydown", onKey)
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("resize", onResize)
    }
  }, [menuOpen])

  const consultationForm = useZodForm(consultationSchema, {
    defaultValues: { firstName: "", email: "", idea: "", details: "" },
  })

  const contactMutation = useMutation({
    mutationFn: (values: ConsultationValues) =>
      axiosInstance.post("/contact", {
        name: values.firstName,
        email: values.email,
        subject: values.idea,
        message: values.details,
      }),
    onSuccess: () => {
      successAlert("Thanks — your inquiry has been sent. We'll be in touch within 48 hours.")
      consultationForm.reset()
    },
    onError: (err: unknown) => {
      const res = (err as { response?: { data?: unknown } })?.response?.data
      const msg =
        typeof res === "string"
          ? res
          : "We couldn't send your message. Please try again in a moment."
      errorAlert(msg)
    },
  })

  const onConsultationSubmit = (values: ConsultationValues) => {
    if (contactMutation.isPending) return
    contactMutation.mutate(values)
  }

  const { data: postsData } = useQuery({
    queryKey: ["artist_post"],
    queryFn: () => axiosInstance.get(`/post`),
  })

  const posts: postInterface[] = Array.isArray(postsData?.data) ? postsData.data : []

  const { data: mapArtistInfo } = useQuery({
    queryKey: ['landing_map_artist'],
    queryFn: async (): Promise<artistInfoInterface[]> => {
      const response = await axiosInstance.get(`/account/artistInfo`);
      return response.data;
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (lightMode) {
      root.classList.add("light")
      root.classList.remove("dark")
    } else {
      root.classList.remove("light")
    }
  }, [lightMode])

  const heroRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)
  const heroImgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import("gsap")
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)

      const heroImgEl  = heroImgRef.current
      const headlineEl = headlineRef.current
      const subEl      = subRef.current
      const ctaEl      = ctaRef.current
      const statsEl    = statsRef.current
      const servicesEl = servicesRef.current
      const galleryEl  = galleryRef.current
      const contactEl  = contactRef.current

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      if (headlineEl) {
        const words = headlineEl.querySelectorAll(".word")
        tl.fromTo(words, { y: 120, opacity: 0, rotateX: -40 }, { y: 0, opacity: 1, rotateX: 0, duration: 1, stagger: 0.08 })
      }

      tl.fromTo(subEl, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.4")
      tl.fromTo(ctaEl, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.3")

      if (heroImgEl) {
        gsap.fromTo(heroImgEl, { x: 200, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "power3.out" })
      }

      if (statsEl) {
        ScrollTrigger.create({
          trigger: statsEl, start: "top 80%",
          onEnter: () => gsap.fromTo(statsEl.querySelectorAll(".stat-num"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.15 }),
          once: true,
        })
      }

      if (servicesEl) {
        ScrollTrigger.create({
          trigger: servicesEl, start: "top 75%",
          onEnter: () => gsap.fromTo(servicesEl.querySelectorAll(".feature-card"), { opacity: 0, y: 50, rotateY: 8 }, { opacity: 1, y: 0, rotateY: 0, duration: 0.8, stagger: 0.15 }),
          once: true,
        })
      }

      if (galleryEl) {
        ScrollTrigger.create({
          trigger: galleryEl, start: "top 75%",
          onEnter: () => gsap.fromTo(galleryEl.querySelectorAll(".gallery-item"), { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.7, stagger: 0.1 }),
          once: true,
        })
      }

      if (contactEl) {
        ScrollTrigger.create({
          trigger: contactEl, start: "top 80%",
          onEnter: () => gsap.fromTo(contactEl, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.9 }),
          once: true,
        })
      }

      return () => {
        ScrollTrigger.getAll().forEach(t => t.kill())
      }
    }

    const cleanup = loadGSAP()
    return () => { cleanup.then(fn => fn?.()) }
  }, [])

  const headline = "Ink that tells your story"
  const words = headline.split(" ")

  const styles = [
    { name: "Blackwork", desc: "Bold, graphic ink with deep blacks and geometric precision.", num: "01" },
    { name: "Fine Line", desc: "Delicate, intricate detail work for subtle and elegant pieces.", num: "02" },
    { name: "Neo-Traditional", desc: "Rich color palettes and illustrative depth with a modern edge.", num: "03" },
    { name: "Dark & Occult", desc: "Our specialty. Gothic imagery, sacred geometry, and esoteric symbolism.", num: "04" },
    { name: "Realism", desc: "Photographic-quality portraits and scenes that stop you in your tracks.", num: "05" },
    { name: "Custom Work", desc: "Bring us your idea — no matter how raw — and we'll build something unforgettable.", num: "06" },
  ]

  const mainArtist = {
    name: "Mara V.",
    role: "Lead Artist · Blackwork & Occult",
    since: "Est. 2016",
    bio: "Over eight years of dedicated practice in dark artistry, sacred geometry, and esoteric symbolism. Every piece is drawn by hand, conceptualized in dialogue, and executed with obsessive attention to detail.",
    specialties: ["Blackwork", "Occult", "Sacred Geometry", "Custom Design"],
  }

  return (
    <div className="min-h-screen bg-primary relative overflow-x-hidden">

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      {/* ─── Header ─── */}
      <header className="border-b border-border fixed w-full bg-primary/85 backdrop-blur-md z-40">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 lg:px-8">

          <div className="flex items-center gap-3 min-w-0">
            <Link href={"/"} className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden">
              <img src="/web/logo.jpg" alt="Ink Of Baphomet logo" className="h-full w-full object-cover" />
            </Link>
            <span
              className="text-text font-light tracking-[0.14em] uppercase truncate text-base sm:text-[1.15rem]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Ink Of Baphomet
            </span>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-2">
            <a href="#styles" className="inline-flex">
              <Button variant="ghost" className="text-sm">Styles</Button>
            </a>
            <a href="#artists" className="inline-flex">
              <Button variant="ghost" className="text-sm">Artists</Button>
            </a>
            <a href="#faq" className="inline-flex">
              <Button variant="ghost" className="text-sm">FAQ</Button>
            </a>
            <div className="w-px h-5 bg-border mx-1" />
            <a href="/guest/login" className="inline-flex">
              <Button variant="outline" className="text-sm">Sign In</Button>
            </a>
            <a href="/guest/register" className="inline-flex">
              <Button className="text-sm">Get Started</Button>
            </a>

            <button
              onClick={() => setLightMode(!lightMode)}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-alt hover:border-gold transition-colors duration-300"
              aria-label="Toggle light/dark mode"
            >
              {lightMode
                ? <Moon className="h-4 w-4 text-text-muted" />
                : <Sun className="h-4 w-4 text-gold" />
              }
            </button>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setLightMode(!lightMode)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-alt hover:border-gold transition-colors duration-300"
              aria-label="Toggle light/dark mode"
            >
              {lightMode
                ? <Moon className="h-4 w-4 text-text-muted" />
                : <Sun className="h-4 w-4 text-gold" />
              }
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-alt hover:border-gold transition-colors duration-300"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              {menuOpen
                ? <X className="h-4 w-4 text-gold" />
                : <Menu className="h-4 w-4 text-text-muted" />
              }
            </button>
          </div>
        </nav>

        {/* Mobile navigation menu */}
        <div
          id="mobile-nav"
          hidden={!menuOpen}
          className="md:hidden w-full border-t border-border bg-primary/95 backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            <a href="#styles" onClick={closeMenu}>
              <Button variant="ghost" className="w-full justify-start text-sm">Styles</Button>
            </a>
            <a href="#artists" onClick={closeMenu}>
              <Button variant="ghost" className="w-full justify-start text-sm">Artists</Button>
            </a>
            <a href="#faq" onClick={closeMenu}>
              <Button variant="ghost" className="w-full justify-start text-sm">FAQ</Button>
            </a>
            <div className="my-2 h-px w-full bg-border" />
            <a href="/guest/login" onClick={closeMenu}>
              <Button variant="outline" className="w-full text-sm">Sign In</Button>
            </a>
            <a href="/guest/register" onClick={closeMenu}>
              <Button className="w-full text-sm">Get Started</Button>
            </a>
          </div>
        </div>
      </header>

      <main>

        {/* ─── Hero ─── */}
        <section
          ref={heroRef}
          className="mx-auto max-w-7xl px-4 pt-24 pb-20 lg:px-8 lg:pt-36 lg:pb-36"
        >
          <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20 items-center">

            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-3 mb-6 self-start">
                <span className="h-px w-8 bg-gold opacity-60" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">Tattoo Studio · Est. 2016</span>
                <span className="h-px w-8 bg-gold opacity-60" />
              </div>

              <h1
                ref={headlineRef}
                className="text-4xl font-light tracking-tight leading-[1.05] sm:text-5xl lg:text-[4.5rem] xl:text-[5.5rem] text-text"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.02em" }}
              >
                {words.map((word, i) => (
                  <span key={i} className="word inline-block mr-[0.22em] last:mr-0" style={{ display: "inline-block" }}>
                    {word}
                  </span>
                ))}
              </h1>

              <p ref={subRef} className="mt-6 text-base leading-relaxed text-text-muted lg:text-lg max-w-lg">
                A private tattoo studio rooted in dark artistry, sacred symbolism, and obsessive craft. Every piece is drawn by hand, built for your skin, and made to last a lifetime.
              </p>

              <div ref={ctaRef} className="mt-8 flex flex-wrap gap-3 items-center">
                <a href="/guest/login">
                  <Button size="lg" className="text-base px-8">Book a Session</Button>
                </a>
              </div>

              <p className="mt-6 text-xs text-text-dim tracking-widest uppercase">
                By appointment only · Walk-ins welcome when available
              </p>
            </div>

            {/* Right — hero image */}
            <div ref={heroImgRef} className="relative px-10 rounded hidden lg:block">
              <img
                src="/web/logo.jpg"
                alt="Ink Of Baphomet studio"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-700 rounded"
              />
              <div className="absolute left-10 inset-0 bg-black/30 rounded" />
            </div>

          </div>
        </section>

        {/* ─── Stats ─── */}
        <section ref={statsRef} className="border-y border-border bg-secondary">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
            <div className="grid gap-0 grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
              {[
                { num: "8+",   label: "Years in Business",   sub: "Open since 2016" },
                { num: "3K+",  label: "Tattoos Completed",   sub: "Every one unique" },
                { num: "3",    label: "Resident Artists",    sub: "Specialists in dark art" },
              ].map((s, i) => (
                <div key={i} className="stat-num text-center py-10 px-6 group">
                  <div
                    className="text-5xl font-light text-gold lg:text-6xl group-hover:text-gold-light transition-colors duration-300"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.04em" }}
                  >
                    {s.num}
                  </div>
                  <div className="mt-2 font-semibold text-sm tracking-[0.12em] uppercase text-text">{s.label}</div>
                  <div className="mt-1 text-xs text-text-muted tracking-wide">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Styles ─── */}
        <section id="styles" className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-36">
          <div className="mb-12 max-w-xl">
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">What We Do</span>
            <h2
              className="mt-4 text-3xl font-light tracking-tight lg:text-5xl text-text"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.02em" }}
            >
              Styles we specialize in
            </h2>
            <p className="mt-4 text-base text-text-muted leading-relaxed">
              We work across a range of disciplines, always with the same commitment to craft and intention.
            </p>
          </div>

          <div ref={servicesRef} className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {styles.map((s, i) => (
              <Card key={i} className="feature-card group relative p-8 overflow-hidden bg-surface border-border hover:border-border-gold transition-all duration-500 rounded-none">
                <span className="absolute top-4 right-6 text-7xl font-light text-text-dim select-none pointer-events-none" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{s.num}</span>
                <h3 className="text-lg font-light mb-3 text-text tracking-wide" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.3rem" }}>{s.name}</h3>
                <p className="text-sm leading-relaxed text-text-muted">{s.desc}</p>
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
              </Card>
            ))}
          </div>
        </section>

        {/* ─── Featured Tattoos ─── */}
        <section id="gallery" className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-36">
            <div className="mb-12 max-w-xl">
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">The Ink</span>
              <h2
                className="mt-4 text-3xl font-light tracking-tight lg:text-5xl text-text"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.02em" }}
              >
                Featured designs
              </h2>
              <p className="mt-4 text-base text-text-muted leading-relaxed">
                Browse original flash designs available for booking. Each piece is a one-of-a-kind original from our artist.
              </p>
            </div>

            {posts.length > 0 ? (
              <div ref={galleryRef} className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {posts.slice(0, 8).map((post) => (
                  <button
                    key={post._id}
                    onClick={() => router.push("/guest/login")}
                    className="gallery-item group relative h-[400px] overflow-hidden bg-surface border border-border hover:border-border-gold transition-all duration-500 text-left w-full"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={post.postImg}
                        alt="Tattoo design"
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 bg-white"
                      />
                    </div>

                    {/* Top gradient */}
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-primary/70 to-transparent" />

                    {/* Price badge */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-surface/90 border border-border-gold text-gold text-xs tracking-[0.1em] px-3 py-1">
                        ₱{post.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Category tag */}
                    {post.category && (
                      <div className="absolute top-4 left-4">
                        <span className="text-[9px] uppercase tracking-[0.18em] text-gold bg-primary/80 border border-border px-2 py-0.5">
                          {post.category}
                        </span>
                      </div>
                    )}

                    {/* Bottom gradient */}
                    <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-primary/90 to-transparent" />

                    {/* Artist info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-3">
                        {post.account?.profile && (
                          <img
                            src={post.account.profile}
                            alt="artist"
                            className="w-9 h-9 object-cover border border-border-gold flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] uppercase tracking-[0.2em] text-gold">
                            {post.account?.type || "Artist"}
                          </p>
                          <h3 className="text-text text-sm font-light truncate" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            {post.account?.name || "Ink Of Baphomet"}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Gold bottom line */}
                    <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/[0.03] transition-colors duration-500" />
                  </button>
                ))}
              </div>
            ) : (
              /* Loading skeleton */
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-[400px] bg-surface-alt border border-border animate-pulse" />
                ))}
              </div>
            )}

          </div>
        </section>

        {/* ─── The Artist ─── */}
        <section id="artists" className="border-t border-border bg-secondary">
          <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-36">
            <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-20 items-center">

              {/* Left — Artist portrait */}
              <div className="relative">
                <div className="absolute -top-3 -left-3 w-full h-full border border-gold/30 pointer-events-none" />
                <div className="aspect-[3/4] bg-surface-alt overflow-hidden relative">
                  <img
                    src="/web/img1.png"
                    alt={mainArtist.name}
                    className="h-full w-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Corner accents */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-gold/60" />
                  <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-gold/60" />
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-gold/60" />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-gold/60" />
                </div>
              </div>

              {/* Right — Artist info */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-px w-8 bg-gold opacity-60" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">{mainArtist.since}</span>
                </div>

                <h2
                  className="text-4xl font-light tracking-tight lg:text-5xl text-text"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.02em" }}
                >
                  {mainArtist.name}
                </h2>

                <p className="mt-2 text-sm tracking-[0.12em] uppercase text-gold/70">
                  {mainArtist.role}
                </p>

                <div className="w-12 h-px bg-gold/40 my-6" />

                <p className="text-base leading-relaxed text-text-muted">
                  {mainArtist.bio}
                </p>

                {/* Specialties */}
                <div className="mt-8">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold mb-4">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {mainArtist.specialties.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] uppercase tracking-[0.2em] text-text-muted border border-border px-3 py-1.5 bg-surface hover:border-border-gold hover:text-gold transition-all duration-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-10 flex flex-wrap gap-3">
                  <Link href="/guest/login">
                    <Button size="lg" className="text-base px-8">
                      Book a Session
                    </Button>
                  </Link>
                  <a href="#gallery">
                    <Button size="lg" variant="outline" className="text-base px-8">
                      View Gallery
                    </Button>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── Map ─── */}
        <section id="map" className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-36">
            <div className="mb-12 max-w-xl">
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">Find Us</span>
              <h2
                className="mt-4 text-3xl font-light tracking-tight lg:text-5xl text-text"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.02em" }}
              >
                Visit the studio
              </h2>
              <p className="mt-4 text-base text-text-muted leading-relaxed">
                Come find us in person. Every tattoo starts with a conversation.
              </p>
            </div>
            <MapWithNoSSR mapArtistInfo={mapArtistInfo ?? []} />
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section id="faq" className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-36">
          <div className="mb-12 max-w-xl mx-auto text-center">
            <span className="text-[10px] font-semibold text-center uppercase tracking-[0.28em] text-gold">Before You Book</span>
            <h2
              className="mt-4 text-3xl font-light text-center tracking-tight lg:text-5xl text-text"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.02em" }}
            >
              Common questions
            </h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-0 divide-y divide-border border-t border-b border-border">
            {[
              { q: "How do I book a session?", a: "Fill out the consultation form below or DM us on Instagram. We'll get back to you within 48 hours to discuss your idea, sizing, placement, and pricing." },
              { q: "Do you take walk-ins?", a: "We are primarily appointment-based, but walk-ins are welcome when an artist has availability. Call ahead to check." },
              { q: "How much does a tattoo cost?", a: "Pricing depends on size, complexity, placement, and the artist you choose. Consultations are free. We'll give you an honest quote before you commit to anything." },
              { q: "What should I do to prepare?", a: "Eat a good meal beforehand, stay hydrated, wear comfortable clothing that allows access to the area being tattooed, and avoid alcohol for 24 hours prior." },
              { q: "Do you do cover-ups?", a: "Yes. Depending on the existing tattoo, a cover-up may require a consultation in person. Send us a photo and we'll let you know what's possible." },
            ].map((item, i) => (
              <details key={i} className="group py-5 cursor-pointer list-none">
                <summary className="flex items-center justify-between gap-4 text-text font-light text-base" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.1rem" }}>
                  {item.q}
                  <ChevronDown className="h-4 w-4 text-gold flex-shrink-0 group-open:rotate-180 transition-transform duration-300" />
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ─── Contact / Book CTA ─── */}
        <section id="contact" className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-36">
          <div ref={contactRef}>
            <Card className="overflow-hidden bg-surface border border-border-gold rounded-none relative">
              <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-gold opacity-40" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-gold opacity-40" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-gold opacity-40" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-gold opacity-40" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.06)_0%,transparent_65%)] pointer-events-none" />

              <div className="grid gap-12 p-8 lg:grid-cols-2 lg:gap-16 lg:p-16">

                {/* Left — info */}
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">Find Us</span>
                  <h2
                    className="mt-4 text-3xl font-light tracking-tight lg:text-4xl text-text"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.02em" }}
                  >
                    Ready to get inked?
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-text-muted">
                    Come visit us or reach out to start your consultation. We'd love to hear your idea.
                  </p>

                  <ul className="mt-8 space-y-5 text-sm text-text-muted">
                    <li className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                      <span>123 Dark Alley St., Studio 4B<br />Your City, State 00000</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gold flex-shrink-0" />
                      <span>(555) 000-1234</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gold flex-shrink-0" />
                      <span>hello@inkofbaphomet.com</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gold flex-shrink-0" />
                      <span>Tue – Sat · 11am – 8pm</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Instagram className="h-4 w-4 text-gold flex-shrink-0" />
                      <a href="#" className="hover:text-gold transition-colors duration-200">@inkofbaphomet</a>
                    </li>
                  </ul>
                </div>

                {/* Right — booking form */}
                <div className="space-y-4">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">Book a Consultation</span>
                  <form onSubmit={consultationForm.handleSubmit(onConsultationSubmit)} noValidate className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-text-muted uppercase tracking-widest">First Name</label>
                      <input
                        type="text"
                        placeholder="Your name"
                        aria-invalid={!!consultationForm.formState.errors.firstName}
                        {...consultationForm.register("firstName")}
                        className={`w-full bg-surface-alt border text-text text-sm px-4 py-3 placeholder:text-text-dim focus:outline-none focus:border-gold transition-colors duration-200 ${consultationForm.formState.errors.firstName ? "border-danger" : "border-border"}`}
                      />
                      <FieldError>{consultationForm.formState.errors.firstName?.message}</FieldError>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-text-muted uppercase tracking-widest">Email</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        aria-invalid={!!consultationForm.formState.errors.email}
                        {...consultationForm.register("email")}
                        className={`w-full bg-surface-alt border text-text text-sm px-4 py-3 placeholder:text-text-dim focus:outline-none focus:border-gold transition-colors duration-200 ${consultationForm.formState.errors.email ? "border-danger" : "border-border"}`}
                      />
                      <FieldError>{consultationForm.formState.errors.email?.message}</FieldError>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-text-muted uppercase tracking-widest">Style / Idea</label>
                    <input
                      type="text"
                      placeholder="e.g. Blackwork sleeve, occult symbols..."
                      aria-invalid={!!consultationForm.formState.errors.idea}
                      {...consultationForm.register("idea")}
                      className={`w-full bg-surface-alt border text-text text-sm px-4 py-3 placeholder:text-text-dim focus:outline-none focus:border-gold transition-colors duration-200 ${consultationForm.formState.errors.idea ? "border-danger" : "border-border"}`}
                    />
                    <FieldError>{consultationForm.formState.errors.idea?.message}</FieldError>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-text-muted uppercase tracking-widest">Tell us more</label>
                    <textarea
                      rows={4}
                      placeholder="Describe your vision, placement, size, references — anything helps."
                      aria-invalid={!!consultationForm.formState.errors.details}
                      {...consultationForm.register("details")}
                      className={`w-full bg-surface-alt border text-text text-sm px-4 py-3 placeholder:text-text-dim focus:outline-none focus:border-gold transition-colors duration-200 resize-none ${consultationForm.formState.errors.details ? "border-danger" : "border-border"}`}
                    />
                    <FieldError>{consultationForm.formState.errors.details?.message}</FieldError>
                  </div>
                  <Button type="submit" size="lg" disabled={contactMutation.isPending} className="w-full text-base mt-2">
                    {contactMutation.isPending ? "Sending…" : "Send Inquiry"}
                  </Button>
                  <p className="text-xs text-text-dim text-center tracking-wide">We respond within 48 hours. No spam, ever.</p>
                  </form>
                </div>

              </div>
            </Card>
          </div>
        </section>

      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-14">
          <div className="grid gap-10 grid-cols-2 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
                  <img src="/web/logo.jpg" alt="Ink Of Baphomet logo" className="h-full w-full object-cover" />
                </div>
                <span className="font-light text-gold tracking-[0.14em] uppercase" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1rem" }}>
                  Ink Of Baphomet
                </span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                A private tattoo studio rooted in dark artistry and sacred craft.
              </p>
            </div>
            {[
              { heading: "Studio",  links: ["Styles", "Artists", "FAQ", "Aftercare"] },
              { heading: "Visit",   links: ["Book a Session", "Walk-ins", "Directions", "Instagram"] },
              { heading: "Legal",   links: ["Privacy Policy", "Terms", "Contact"] },
            ].map((col) => (
              <div key={col.heading}>
                <h4 className="mb-4 font-semibold text-[10px] tracking-[0.24em] uppercase text-text">{col.heading}</h4>
                <ul className="space-y-3 text-sm text-text-muted">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="hover:text-gold transition-colors duration-200 tracking-wide">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-text-dim tracking-widest uppercase">
            <span>© 2025 Ink Of Baphomet. All rights reserved.</span>
            <span>Tattoo studio · By appointment</span>
          </div>
        </div>
      </footer>

    </div>
  )
}