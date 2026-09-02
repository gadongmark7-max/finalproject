"use client"
import { accountInterface, bussinessInfoInterface, artistInfoInterface } from "@/app/types/accounts.type"
import { User, MapPin, ChevronRight } from "lucide-react"
import { StarReviews } from "@/components/ui/starRating"

export function ProfileDisplay({ callback, userProfile, account, distance }: { distance: number, callback: () => void, userProfile: bussinessInfoInterface | artistInfoInterface, account: accountInterface }) {
  return (
    <div
      onClick={callback}
      className="group relative flex items-center gap-4 px-5 py-4 cursor-pointer border-b border-border hover:bg-surface-alt transition-all duration-200"
    >
      {/* Gold left reveal bar */}
      <div className="absolute left-0 top-0 w-[2px] h-0 bg-gold group-hover:h-full transition-all duration-300" />

      {/* Avatar */}
      <img
        src={account.profile}
        alt={account.name}
        className="w-11 h-11 object-cover border border-border group-hover:border-border-gold transition-all duration-200 flex-shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[9px] uppercase tracking-[0.2em] text-gold">{account.type}</span>
        </div>
        <h3
          className="text-sm font-light text-text truncate"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {account.name}
        </h3>

        <div className="flex items-center gap-1.5 mt-1">
          <MapPin className="w-3 h-3 text-text-dim flex-shrink-0" />
          <p className="text-[10px] text-text-muted tracking-wide">
            {distance.toFixed(2)} km away
          </p>
        </div>

        <div className="mt-1">
          <StarReviews userProfile={userProfile} />
        </div>
      </div>

      {/* Action hint */}
      <ChevronRight className="w-3.5 h-3.5 text-text-dim group-hover:text-gold transition-colors duration-200 flex-shrink-0" />
    </div>
  )
}