"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft, ImageOff, Search, SearchX, RotateCcw, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { postInterface } from "@/app/types/post.type";
import axiosInstance from "@/app/utils/axios";
import useUserStore from "@/app/store/useUserStore";
import LoadingScreen from "@/components/ui/loadingScreen";
import { confirmAlert, successAlert, errorAlert } from "@/app/utils/alert";

export default function Page() {
  const { user } = useUserStore();

  const [posts, setPosts] = useState<postInterface[]>([]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["artist_deleted_post"],
    queryFn: () => axiosInstance.get(`/post/account/${user?._id}/deleted`),
    enabled: !!user?._id,
  });

  useEffect(() => {
    if (data?.data) setPosts(data.data);
  }, [data]);

  const [search, setSearch] = useState("");
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return posts;
    return posts.filter((post) => {
      const inCategory = post.category?.toLowerCase().includes(query);
      const inTags = post.tags?.some((tag) =>
        tag.trim().toLowerCase().includes(query),
      );
      return inCategory || inTags;
    });
  }, [posts, search]);

  const restoreMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.put(`/post/${id}/restore`),
    onSuccess: (_response, id) => {
      successAlert("Post restored to active listings");
      setPosts((prev) => prev.filter((p) => p._id !== id));
      setRestoringId(null);
    },
    onError: () => {
      errorAlert("error occured");
      setRestoringId(null);
    },
  });

  const handleRestore = (post: postInterface) => {
    confirmAlert(
      "This post will be restored to your active listings and visible to clients again.",
      "Restore Post",
      () => {
        setRestoringId(post._id);
        restoreMutation.mutate(post._id);
      },
    );
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="w-full min-h-dvh bg-primary overflow-auto">
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      {/* Page Header */}
      <div className="bg-secondary border-b border-border px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto flex items-end justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                Artist Portfolio
              </span>
            </div>
            <h1
              className="text-4xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Trash
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Posts removed from your active listings. Restore any of them to bring them back.
            </p>
          </div>

          <Link href="/pages/artist/myPost">
            <Button type="button" variant="outline" size="lg" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to My Posts
            </Button>
          </Link>
        </div>

        {posts.length > 0 && (
          <div className="max-w-7xl mx-auto mt-6 relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deleted posts by tag or style…"
              className="pl-9 max-w-md"
            />
          </div>
        )}
      </div>

      {/* Trash Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {isError ? (
          <div className="border border-dashed border-danger-border flex flex-col items-center justify-center py-28 gap-4 bg-surface">
            <div className="bg-surface-alt border border-border p-4">
              <ImageOff className="w-8 h-8 text-danger-light" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-text-muted">Couldn&apos;t load deleted posts</p>
              <p className="text-xs text-text-dim tracking-wide">Please try again in a moment</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="border border-dashed border-border flex flex-col items-center justify-center py-28 gap-4 bg-surface">
            <div className="bg-surface-alt border border-border p-4">
              <Trash2 className="w-8 h-8 text-text-dim" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-text-muted">No deleted tattoo posts</p>
              <p className="text-xs text-text-dim tracking-wide">
                Posts you delete will appear here and can be restored anytime
              </p>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="border border-dashed border-border flex flex-col items-center justify-center py-28 gap-4 bg-surface">
            <div className="bg-surface-alt border border-border p-4">
              <SearchX className="w-8 h-8 text-text-dim" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-text-muted">
                No deleted posts match &quot;{search}&quot;
              </p>
              <p className="text-xs text-text-dim tracking-wide">
                Try a different tag or style name
              </p>
            </div>
          </div>
        ) : (
          <>
            {search.trim() && (
              <p className="text-xs text-text-dim tracking-wide uppercase mb-4">
                {filteredPosts.length} result
                {filteredPosts.length === 1 ? "" : "s"} for &quot;
                {search.trim()}&quot;
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPosts.map((post) => {
                const isRestoring = restoreMutation.isPending && restoringId === post._id;
                return (
                  <div
                    key={post._id}
                    className="group relative h-[500px] overflow-hidden border border-border hover:border-border-gold transition-all duration-500"
                  >
                    {/* Full Image */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white">
                      <img
                        src={post.postImg}
                        alt="post"
                        className="w-full h-full object-contain opacity-60 grayscale"
                      />
                    </div>

                    {/* Dark gradient top */}
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-primary/70 to-transparent" />

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-surface/90 border border-border-gold text-gold text-xs tracking-[0.1em] px-3 py-1">
                        ₱{post.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Category + Deleted date */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-1 max-w-[70%]">
                      <span className="text-[9px] uppercase tracking-[0.18em] text-gold bg-primary/80 border border-border px-2 py-0.5">
                        {post.category}
                      </span>
                      {post.deletedAt && (
                        <span className="text-[9px] uppercase tracking-[0.18em] text-danger-light bg-primary/80 border border-danger-border px-2 py-0.5">
                          Deleted {new Date(post.deletedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Dark gradient bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/90 to-transparent" />

                    {/* Artist Info + Restore */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.account.profile}
                          alt="artist"
                          className="w-9 h-9 object-cover border border-border-gold flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] uppercase tracking-[0.2em] text-gold">
                            {post.account.type}
                          </p>
                          <h2
                            className="text-text text-sm font-light truncate"
                            style={{ fontFamily: "'Cormorant Garamond', serif" }}
                          >
                            {post.account.name}
                          </h2>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRestore(post)}
                        disabled={isRestoring}
                        className="w-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] px-4 py-3 border border-gold text-gold hover:bg-gold hover:text-primary transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {isRestoring ? "Restoring..." : "Restore"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
