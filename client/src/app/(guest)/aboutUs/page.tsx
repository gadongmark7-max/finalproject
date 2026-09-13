"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Target, Lightbulb, Award, Code, Heart } from "lucide-react"
import Link from "next/link"

export default function AboutUsPage() {
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
      <div className="max-w-6xl mx-auto mb-20 text-center">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-10 bg-gold opacity-60" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Our Story</span>
          <div className="h-px w-10 bg-gold opacity-60" />
        </div>

        <h1
          className="text-5xl font-light tracking-[-0.02em] text-text mb-5"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          About Us
        </h1>
        <p className="text-text-muted text-base max-w-3xl mx-auto leading-relaxed">
          We are a team of college studen from NCST Dasmariñas, passionate about transforming the tattoo industry through innovative technology.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid gap-5">

        {/* Project Overview */}
        <div className="group relative bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden">
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
          <div className="p-8">
            <div className="flex flex-row items-center gap-4 mb-5">
              <div className="bg-surface-alt border border-border group-hover:border-border-gold p-2.5 transition-all duration-300">
                <Target className="w-5 h-5 text-gold" />
              </div>
              <h2
                className="text-2xl font-light tracking-[-0.02em] text-text"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Our Project
              </h2>
            </div>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p className="text-base text-text">
                <span className="font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Development of a Web-Based Integrated Management Platform for Tattoo Services with Decision Support System, 3D Tattoo Customization, Smart Pricing System and Mobile Application in Cavite
                </span>
              </p>
              <p className="text-sm">
                This capstone project represents our commitment to bridging the gap between traditional tattoo artistry and modern technology. We're creating a comprehensive digital solution that serves both tattoo artists and clients in Cavite and beyond.
              </p>
            </div>
          </div>
        </div>

        {/* Our Mission */}
        <div className="group relative bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden">
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
          <div className="p-8">
            <div className="flex flex-row items-center gap-4 mb-5">
              <div className="bg-surface-alt border border-border group-hover:border-border-gold p-2.5 transition-all duration-300">
                <Heart className="w-5 h-5 text-gold" />
              </div>
              <h2
                className="text-2xl font-light tracking-[-0.02em] text-text"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Our Mission
              </h2>
            </div>
            <div className="space-y-3 text-text-muted text-sm leading-relaxed">
              <p>
                To revolutionize the tattoo industry in Cavite by providing an integrated digital platform that streamlines operations, enhances client experience, and empowers tattoo artists with cutting-edge tools for business management and creative design.
              </p>
              <p>
                We aim to make tattoo services more accessible, transparent, and efficient through technology-driven solutions that benefit both artists and clients.
              </p>
            </div>
          </div>
        </div>

        {/* What We're Building — CTA card with corner brackets */}
        <div className="group relative bg-secondary border border-border hover:border-border-gold transition-all duration-500 overflow-hidden">
          {/* Gold corner brackets */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-gold opacity-40" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-gold opacity-40" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-gold opacity-40" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-gold opacity-40" />
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

          <div className="p-8">
            <div className="flex flex-row items-center gap-4 mb-5">
              <div className="bg-surface-alt border border-border group-hover:border-border-gold p-2.5 transition-all duration-300">
                <Lightbulb className="w-5 h-5 text-gold" />
              </div>
              <h2
                className="text-2xl font-light tracking-[-0.02em] text-text"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                What We're Building
              </h2>
            </div>
            <div className="space-y-3 text-text-muted text-sm leading-relaxed">
              <p><span className="text-gold font-light">Integrated Management Platform —</span> Comprehensive tools for appointment scheduling, client management, and business operations.</p>
              <p><span className="text-gold font-light">Decision Support System —</span> Data-driven insights to help artists and shop owners make informed business decisions.</p>
              <p><span className="text-gold font-light">3D Tattoo Customization —</span> Interactive visualization tool allowing clients to preview tattoos on their body before commitment.</p>
              <p><span className="text-gold font-light">Smart Pricing System —</span> Intelligent pricing calculator based on size, complexity, placement, and artist expertise.</p>
              <p><span className="text-gold font-light">Mobile Application —</span> Convenient access to all features on-the-go for both artists and clients.</p>
            </div>
          </div>
        </div>

        {/* Who We Are */}
        <div className="group relative bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden">
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
          <div className="p-8">
            <div className="flex flex-row items-center gap-4 mb-5">
              <div className="bg-surface-alt border border-border group-hover:border-border-gold p-2.5 transition-all duration-300">
                <Users className="w-5 h-5 text-gold" />
              </div>
              <h2
                className="text-2xl font-light tracking-[-0.02em] text-text"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Who We Are
              </h2>
            </div>
            <div className="space-y-3 text-text-muted text-sm leading-relaxed">
              <p>
                We are Information Technology students at <span className="text-text">National College of Science and Technology (NCST) Dasmariñas</span>, working together to develop this innovative platform as our capstone project.
              </p>
              <p>
                Our team combines technical expertise with a passion for solving real-world problems in the local tattoo industry. Through extensive research and consultation with tattoo artists and clients in Cavite, we've identified key pain points and designed solutions that address genuine needs.
              </p>
            </div>
          </div>
        </div>

        {/* Our Vision */}
        <div className="group relative bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden">
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
          <div className="p-8">
            <div className="flex flex-row items-center gap-4 mb-5">
              <div className="bg-surface-alt border border-border group-hover:border-border-gold p-2.5 transition-all duration-300">
                <Award className="w-5 h-5 text-gold" />
              </div>
              <h2
                className="text-2xl font-light tracking-[-0.02em] text-text"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Our Vision
              </h2>
            </div>
            <div className="space-y-3 text-text-muted text-sm leading-relaxed">
              <p>
                To become the leading digital platform for tattoo services in Cavite, setting new standards for professionalism, transparency, and client satisfaction in the industry.
              </p>
              <p>
                We envision a future where getting a tattoo is a seamless, informed, and confident experience—from initial design exploration to final artwork—supported by technology that respects the artistry and craft of tattooing.
              </p>
            </div>
          </div>
        </div>

        {/* Our Commitment */}
        <div className="group relative bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden">
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
          <div className="p-8">
            <div className="flex flex-row items-center gap-4 mb-5">
              <div className="bg-surface-alt border border-border group-hover:border-border-gold p-2.5 transition-all duration-300">
                <Code className="w-5 h-5 text-gold" />
              </div>
              <h2
                className="text-2xl font-light tracking-[-0.02em] text-text"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Our Commitment
              </h2>
            </div>
            <div className="space-y-2 text-text-muted text-sm leading-relaxed">
              <p><span className="text-gold font-light">Innovation —</span> Continuously improving our platform with the latest technologies.</p>
              <p><span className="text-gold font-light">Quality —</span> Delivering reliable, user-friendly solutions that exceed expectations.</p>
              <p><span className="text-gold font-light">Support —</span> Providing comprehensive guidance and assistance to our users.</p>
              <p><span className="text-gold font-light">Community —</span> Building strong relationships within the local tattoo community.</p>
              <p><span className="text-gold font-light">Safety —</span> Prioritizing hygiene standards, ethical practices, and client education.</p>
            </div>
          </div>
        </div>

        {/* Closing Statement */}
        <div className="text-center py-12 border-t border-border mt-4">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10 bg-gold opacity-40" />
            <div className="w-1 h-1 bg-gold opacity-60" />
            <div className="h-px w-10 bg-gold opacity-40" />
          </div>

          <p className="text-text-muted text-sm max-w-3xl mx-auto leading-relaxed mb-6">
            This platform is more than just a project — it's our contribution to elevating the tattoo industry in Cavite through technology, innovation, and a genuine passion for making a difference.
          </p>
          <p
            className="text-gold font-light text-lg tracking-[0.08em] uppercase"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            NCST Dasmariñas &nbsp;·&nbsp; Information Technology &nbsp;·&nbsp; Capstone Project 2025
          </p>
        </div>

      </div>
    </div>
  )
}