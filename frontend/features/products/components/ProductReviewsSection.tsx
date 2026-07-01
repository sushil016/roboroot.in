import React, { useEffect, useState } from "react";
import { RatingBreakdown } from "./reviews/RatingBreakdown";
import { ReviewCard } from "./reviews/ReviewCard";
import { ReviewFormModal } from "./reviews/ReviewFormModal";
import { reviewApi, type Review, type ComponentReviewsResponse } from "../services/review.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { PenSquare, MessageSquare } from "lucide-react";

interface ProductReviewsSectionProps {
  componentId: string;
  productName: string;
}

export function ProductReviewsSection({
  componentId,
  productName,
}: ProductReviewsSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<ComponentReviewsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadReviews(pageNum: number, shouldAppend = false) {
    setIsLoading(true);
    try {
      const result = await reviewApi.getReviews(componentId, pageNum, 5);
      if (shouldAppend && data) {
        setData({
          ...result,
          reviews: [...data.reviews, ...result.reviews],
        });
      } else {
        setData(result);
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (componentId) {
      void loadReviews(1, false);
      setPage(1);
    }
  }, [componentId]);

  async function handleWriteReviewClick() {
    if (!isAuthenticated) {
      toast.error("Please login to write a review", {
        description: "Only logged-in customers can leave reviews.",
      });
      return;
    }
    setIsModalOpen(true);
  }

  async function handleReviewSubmit(rating: number, title: string, body: string, imageUrl?: string) {
    try {
      await reviewApi.submitReview(componentId, rating, title, body, imageUrl);
      toast.success("Review submitted!", {
        description: "Your review has been submitted and is pending moderation.",
      });
      // Reload reviews
      void loadReviews(1, false);
      setPage(1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit review");
      throw error;
    }
  }

  async function handleReviewDelete(reviewId: string) {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await reviewApi.deleteReview(reviewId);
      toast.success("Review deleted successfully");
      // Reload reviews
      void loadReviews(1, false);
      setPage(1);
    } catch (error) {
      toast.error("Failed to delete review");
    }
  }

  const hasMore = data ? data.page < data.totalPages : false;

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    void loadReviews(nextPage, true);
  };

  const averageRating = data?.averageRating ?? 0;
  const reviewCount = data?.reviewCount ?? 0;
  const breakdown = data?.breakdown ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <section className="space-y-8 border-t border-[#D8D8C4] pt-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1CA2D1]">
            Customer Feedback
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-[#222222]">
            Ratings & Reviews
          </h2>
        </div>
        <button
          onClick={handleWriteReviewClick}
          className="flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[#222222] hover:bg-[#1CA2D1] text-xs font-bold text-white transition active:scale-95 cursor-pointer shadow-xs"
        >
          <PenSquare className="h-4 w-4" />
          <span>Write a Review</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Rating breakdown (left column) */}
        <div className="md:col-span-1">
          <RatingBreakdown
            averageRating={averageRating}
            reviewCount={reviewCount}
            breakdown={breakdown}
          />
        </div>

        {/* Reviews list (right column) */}
        <div className="md:col-span-2 space-y-4">
          {data && data.reviews.length > 0 ? (
            <div className="space-y-4">
              {data.reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  currentUserId={user?.id}
                  isAdmin={(user?.role as string) === "ADMIN" || (user?.role as string) === "SUPER_ADMIN"}
                  onDelete={handleReviewDelete}
                />
              ))}

              {hasMore && (
                <div className="pt-2 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="h-10 px-6 border border-zinc-200 hover:bg-zinc-50 font-bold text-xs text-zinc-600 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? "Loading..." : "Load More Reviews"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl p-10 text-center space-y-3">
              <div className="size-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-[#222222] text-sm">No reviews yet</h4>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Have you purchased this component? Be the first to share your thoughts and help other makers!
              </p>
            </div>
          )}
        </div>
      </div>

      <ReviewFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReviewSubmit}
        productName={productName}
      />
    </section>
  );
}
