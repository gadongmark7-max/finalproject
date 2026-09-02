import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const CardTempalte = ({ title, value, hasPhp } : { title: string, value: number, hasPhp: boolean }) => {

  return (
      <div className="group relative w-full h-full bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden p-6 flex flex-col justify-between">

          {/* Gold bottom reveal */}
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

          {/* Subtle left accent */}
          <div className="absolute top-0 left-0 w-[2px] h-0 bg-gold group-hover:h-full transition-all duration-500" />

          {/* Top: label */}
          <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-1">
                  <div className="h-px w-4 bg-gold opacity-60" />
                  <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                      {hasPhp ? "Revenue" : "Studio"}
                  </span>
              </div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted leading-relaxed">
                  {title}
              </p>
          </div>

          {/* Bottom: value */}
          <div className="mt-4">
              <p
                  className="text-3xl font-light text-text tracking-[-0.02em] tabular-nums"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                  {hasPhp && <span className="text-gold mr-1">₱</span>}
                  {value.toLocaleString()}
              </p>
          </div>
      </div>
  )
}