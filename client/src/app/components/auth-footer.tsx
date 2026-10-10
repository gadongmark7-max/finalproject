import React from "react";

function AuthFooter() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-14">
        <div className="grid gap-10 grid-cols-2 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
                <img
                  src="/web/logo.jpg"
                  alt="Ink Of Baphomet logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span
                className="font-light text-gold tracking-[0.14em] uppercase"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "1rem",
                }}
              >
                Ink Of Baphomet
              </span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              A private tattoo studio rooted in dark artistry and sacred craft.
            </p>
          </div>
          {[
            {
              heading: "Visit",
              links: [{ label: "Book a Session", href: "/login" }],
            },
            {
              heading: "Legal",
              links: [
                {
                  label: "Contact Developer",
                  href: "mailto:inkofbaphomet@gmail.com",
                },
              ],
            },
          ].map((col) => (
            <div key={col.heading}>
              <h4 className="mb-4 font-semibold text-[10px] tracking-[0.24em] uppercase text-text">
                {col.heading}
              </h4>

              <ul className="space-y-3 text-sm text-text-muted">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="tracking-wide transition-colors duration-200 hover:text-gold"
                    >
                      {link.label}
                    </a>
                  </li>
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
  );
}

export default AuthFooter;
