"use client"
import { bussinessInfoInterface, artistInfoInterface } from "@/app/types/accounts.type"

export function StarReviews({ userProfile }: { userProfile: bussinessInfoInterface | artistInfoInterface }) {
  const reviews = userProfile.reviews

  const averageRating =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <div className="flex gap-1 text-xl mt-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= averageRating ? "text-gold" : "text-text-dim"}
        >
          ★
        </span>
      ))}
    </div>
  )
}