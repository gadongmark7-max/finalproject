"use client"
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";


export default function Layout({ children } : { children: React.ReactNode }) {


    return (
      <div className="flex min-h-screen ">
     
        <main className="border-b border-border  w-full bg-primary">



          <div className="mb-[80px] md:mb-[0px]"> </div>
          {children}

         {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-secondary">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
                  <img src="/web/logo.jpg" alt="Ink Of Baphomet logo" className="h-full w-full object-cover" />
                </div>
                <span
                  className="font-light text-gold tracking-[0.14em] uppercase"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1rem" }}
                >
                  Ink Of Baphomet
                </span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                The complete platform for tattoo artistry and discovery.
              </p>
            </div>
            {[
              { heading: "Product", links: ["Features", "Pricing", "FAQ"] },
              { heading: "Company", links: ["About", "Blog", "Careers"] },
              { heading: "Legal",   links: ["Privacy", "Terms", "Contact"] },
            ].map((col) => (
              <div key={col.heading}>
                <h4 className="mb-4 font-semibold text-[10px] tracking-[0.24em] uppercase text-text">{col.heading}</h4>
                <ul className="space-y-3 text-sm text-text-muted">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="hover:text-gold transition-colors duration-200 tracking-wide">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-text-dim tracking-widest uppercase">
            <span>© 2025 Ink Of Baphomet. All rights reserved.</span>
            <span>Crafted with care for artists & clients</span>
          </div>
        </div>
      </footer>
  
        </main>
      </div>
    );
  }