"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { successAlert, errorAlert } from "@/app/utils/alert"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { bookingInterface } from "@/app/types/booking.type"
import { LoaderCircle , Star} from "lucide-react"
import { useImageField } from "@/lib/validation/useFileField"
import { FieldError } from "@/components/ui/field-error"
import { firstError, longText } from "@/lib/validation/fields"

const commentSchema = longText("Comment", { min: 3, max: 500 })


const reviewSuggestions: Record<number, string[]> = {
  1: [
    "Very disappointing work.",
    "Not satisfied with the result.",
  ],
  2: [
    "Below expectations.",
    "Some parts were not done well.",
  ],
  3: [
    "Average experience.",
    "It was okay overall."
  ],
  4: [
    "Good work and professional.",
    "Very satisfied.",
  ],
  5: [
    "Excellent work!",
    "Outstanding quality and service."
  ]
};

export function ReviewModal({ booking, setBookings } : { booking : bookingInterface, setBookings : (data : bookingInterface[]) => void}) {

  const [open, setOpen] = useState(false);

  const [text, setText] = useState<string>("")
  const [rating, setRating] = useState(0)

  const { file: img, preview, error: imgError, onSelect, reset } = useImageField()

  const commentError = firstError(commentSchema, text)
  const ratingError = rating < 1 ? "Please pick a star rating" : undefined

  const submitMutation = useMutation({
    mutationFn : (data : FormData) => axiosInstance.post("/account/review", data),
    onSuccess : (response) => {
        successAlert("Review Submited")
        setBookings(response.data.reverse())
        setOpen(false)
        reset()
        setText("")
        setRating(0)
    },
    onError : () => errorAlert("error accour")
  })

  const handleSubmit = () => {
    if(!img) return errorAlert(imgError ?? "Please choose an image")
    if(ratingError) return errorAlert(ratingError)
    const parsedComment = commentSchema.safeParse(text)
    if(!parsedComment.success) return errorAlert(parsedComment.error.issues[0]?.message ?? "Please write a comment")
    const formData = new FormData()
    formData.append("file", img)
    formData.append("rating", rating.toString())
    formData.append("comment", text)
    formData.append("bookingId", booking._id)
    formData.append("artistId", booking.artist._id)
    formData.append("bussinessId",  booking?.bussiness?._id ?? "none")
    submitMutation.mutate(formData)
  }


    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
            <Button   onClick={() => setOpen(true)}>
              <Star /> Place Reviews
            </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            Share your experience with the artist
          </DialogDescription>
        </DialogHeader>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LEFT: IMAGE */}
          <div className="flex flex-col items-center gap-4">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-[280px] h-[280px] object-cover rounded"
              />
            ) : (
              <div className="w-[280px] h-[280px] border rounded flex items-center justify-center text-muted-foreground">
                No image
              </div>
            )}

            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => onSelect(e.target.files?.[0] || null)}
              aria-invalid={!!imgError}
              className="max-w-[280px]"
            />
            <FieldError>{imgError}</FieldError>
          </div>

          {/* RIGHT: RATING + COMMENT */}
        {/* RIGHT: COMMENT + RATING */}
          <div className="flex flex-col  h-full">


            {/* STAR RATING (BOTTOM) */}
            <div className="">
              <p className="text-sm font-medium mb-1 text-gold">Rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition
                      ${star <= rating ? "text-yellow-400" : "text-gray-300"}
                    `}
                  >
                    ★
                  </button>
                ))}
              </div>
              <FieldError>{ratingError}</FieldError>
            </div>


          {/* RECOMMENDED COMMENTS */}
            {rating > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2 text-gold">
                  Suggested Review
                </p>

                <div className="flex flex-wrap gap-2">
                  {reviewSuggestions[rating].map((comment, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setText(comment)}
                      className="text-xs text-white px-3 py-2 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] hover:border-yellow-400 transition"
                    >
                      {comment}
                    </button>
                  ))}
                </div>
              </div>
            )}



            {/* COMMENT */}
            <div className="space-y-2 mt-4">
              <p className="text-sm font-medium text-gold">Comment</p>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                aria-invalid={!!commentError}
                className="h-32 resize-none"
                placeholder="Write your review..."
              />
              <FieldError>{commentError}</FieldError>
            </div>

            

          </div>

        </div>

        <DialogFooter className="mt-6">
          <Button onClick={handleSubmit} disabled={submitMutation.isPending || !img || !!ratingError || !!commentError} className="w-full">
            {submitMutation.isPending && (
              <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
            )}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>

    </Dialog>
  )
}
