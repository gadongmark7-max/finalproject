import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { artistInfoInterface, bussinessInfoInterface } from "@/app/types/accounts.type";
import { postInterface } from "@/app/types/post.type";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { accountInterface } from "@/app/types/accounts.type";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageCircle, User, Route, Star } from "lucide-react";
import useUserStore from "@/app/store/useUserStore";
import { StarReviews } from "@/components/ui/starRating";

export function ProfileOverview({
  userProfile,
  account,
  open,
  setOpen,
  setPointB
}: {
  userProfile: artistInfoInterface | bussinessInfoInterface;
  account: accountInterface;
  open: boolean;
  setOpen: (val: boolean) => void;
  setPointB: (val: { lat: number; lng: number }) => void;
}) {
  const router = useRouter();
  const { user } = useUserStore();

  const { data: posts } = useQuery({
    queryKey: ["postsss"],
    queryFn: async (): Promise<postInterface[]> => {
      const response = await axiosInstance.get(`/post/account/${account._id}`);
      return response.data;
    },
  });

  const messageMutation = useMutation({
    mutationFn: () => axiosInstance.post(`/convo/convoId/${account._id}`),
    onSuccess: (response) => {
      router.push(`/pages/client/convo/${response.data}`);
    },
    onError: () => alert("Error occurred"),
  });

  const showRoute = () => {
    setPointB({ lat: account.location?.lat!, lng: account.location?.long! });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} modal={false}>
      <SheetContent
        className="z-[1000] p-0 max-w-[400px] flex flex-col overflow-hidden"
        side="right"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-8 pb-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px w-6 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
              {account.type === "artist" ? "Artist Profile" : "Business Profile"}
            </span>
          </div>
          <SheetTitle
            className="text-2xl font-light text-text tracking-[-0.02em]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Profile Overview
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-8">

          {/* Profile Card */}
          <div className="relative bg-surface border border-border p-5 group transition-all duration-500 hover:border-border-gold">
            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

            {/* Avatar + Name */}
            <div className="flex items-center gap-4 mb-5">
              <img
                src={account.profile}
                alt={account.name}
                className="w-16 h-16 object-cover border border-border-gold flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-1">
                  {account.type}
                </p>
                <h1
                  className="text-xl font-light text-text truncate"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {account.name}
                </h1>
                <StarReviews userProfile={userProfile} />
              </div>
            </div>

            <div className="h-px w-full bg-border mb-5" />

            {/* Action Buttons */}
            <div className="space-y-2">
              <Link
                href={`/pages/client/${
                  account.type === "artist" ? "artistProfile" : "bussinessProfile"
                }/${account._id}`}
                className="block"
              >
                <Button variant="outline" className="w-full gap-2">
                  <User className="w-3.5 h-3.5" />
                  View Full Profile
                </Button>
              </Link>

              <div className="grid grid-cols-2 gap-2">
                {user?._id !== account._id && (
                  <Button variant="default" onClick={() => messageMutation.mutate()} className="gap-2">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Message
                  </Button>
                )}
                <Button variant="default" onClick={showRoute} className="gap-2">
                  <Route className="w-3.5 h-3.5" />
                  Show Route
                </Button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Reviews</span>
            </div>

            {userProfile.reviews.length === 0 ? (
              <div className="border border-border bg-surface p-6 text-center">
                <p className="text-text-muted text-sm">No reviews yet</p>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {userProfile.reviews.map((review, index) => (
                  <div
                    key={index}
                    className="min-w-[220px] flex-shrink-0 bg-surface border border-border p-4 space-y-3 transition-all duration-300 hover:border-border-gold"
                  >
                    {/* Reviewer */}
                    <div className="flex items-center gap-3">
                      <img
                        src={review.client.profile}
                        alt={review.client.name}
                        className="w-9 h-9 object-cover border border-border flex-shrink-0"
                      />
                      <div>
                        <p className="text-text text-sm font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                          {review.client.name}
                        </p>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((starNum) => (
                            <Star
                              key={starNum}
                              className={`w-3 h-3 ${
                                starNum <= review.rating
                                  ? "text-gold fill-gold"
                                  : "text-text-dim"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-text-muted text-xs leading-relaxed">{review.comment}</p>

                    {review.img && (
                      <img
                        src={review.img}
                        alt="review"
                        className="w-full max-h-[100px] object-cover border border-border"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Posts Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Posts</span>
            </div>

            {!posts || posts.length === 0 ? (
              <div className="border border-border bg-surface p-6 text-center">
                <p className="text-text-muted text-sm">No posts yet</p>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="relative min-w-[160px] h-40 flex-shrink-0 overflow-hidden border border-border group transition-all duration-300 hover:border-border-gold"
                  >
                    <img
                      src={post.postImg}
                      alt="post"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                    {/* Price */}
                    <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-[0.15em] text-gold bg-primary/80 border border-border-gold px-2 py-0.5">
                      ₱{post.price.toLocaleString()}
                    </span>
                    {/* Gold bottom line */}
                    <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}