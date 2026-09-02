"use client";
import { artistInfoInterface } from "@/app/types/accounts.type";


export default function ReviewsComponent({artistInfo} : { artistInfo : artistInfoInterface}) {
    
  return (
    <>
        <h1 className="text-lg font-semibold text-gold">Reviews</h1>

        {/* REVIEWS LIST */}
        <div className="space-y-4 overflow-y-auto pr-2">
        {artistInfo.reviews.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
            No reviews yet
            </p>
        )}

        {artistInfo.reviews.map((review, index) => (
            <div
            key={index}
            className="border rounded-lg p-3 flex gap-3 bg-secondary"
            >
            {/* AVATAR */}
            <img
                src={review.client.profile}
                alt="client"
                className="w-10 h-10 rounded-full object-cover"
            />

            {/* CONTENT */}
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                <h1 className="font-medium text-sm text-gold">
                    {review.client.name}
                </h1>

                {/* STAR DISPLAY */}
                <div className="flex gap-1 text-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={
                        star <= review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                    >
                        ★
                    </span>
                    ))}
                </div>
                </div>

                <p className="text-sm text-muted-foreground">
                {review.comment}
                </p>

                {review.img && (
                <img
                    src={review.img}
                    alt="review"
                    className="mt-2 w-full max-h-[140px] object-cover rounded"
                />
                )}
            </div>
            </div>
        ))}
        </div>
    </>
  );
}
