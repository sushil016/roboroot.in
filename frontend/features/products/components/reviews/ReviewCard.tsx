import React from "react";
import { User, CheckCircle2, Trash2 } from "lucide-react";
import type { Review } from "../../services/review.service";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  isAdmin?: boolean;
  onDelete?: (reviewId: string) => void;
}

export function ReviewCard({
  review,
  currentUserId,
  isAdmin,
  onDelete,
}: ReviewCardProps) {
  const formattedDate = new Date(review.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isOwner = currentUserId === review.userId;
  const canDelete = onDelete && (isOwner || isAdmin);

  // Helper for star badge color
  const getBadgeColor = (rating: number) => {
    if (rating >= 4) return "bg-emerald-600";
    if (rating === 3) return "bg-green-500";
    if (rating === 2) return "bg-amber-500";
    return "bg-orange-600";
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#D8D8C4] shadow-xs space-y-4 hover:border-zinc-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Rating and Title */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-0.5 text-white text-xs font-black px-2 py-0.5 rounded-md shrink-0",
            getBadgeColor(review.rating)
          )}>
            <span>{review.rating}</span>
            <span>★</span>
          </div>
          {review.title && (
            <h4 className="font-bold text-[#222222] text-sm sm:text-base leading-snug">
              {review.title}
            </h4>
          )}
        </div>

        {/* Delete button if owner or admin */}
        {canDelete && (
          <button
            onClick={() => onDelete(review.id)}
            className="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
            title="Delete Review"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Review Body */}
      {review.body && (
        <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
          {review.body}
        </p>
      )}

      {/* Footer / Meta Info */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400 font-semibold pt-1 border-t border-zinc-50">
        <div className="flex items-center gap-1.5 text-zinc-600">
          <div className="size-5 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden">
            {review.user?.avatarUrl ? (
              <img src={review.user.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <User className="h-3 w-3 text-zinc-400" />
            )}
          </div>
          <span>{review.user?.name || "RoboRoot Customer"}</span>
        </div>

        <span>•</span>
        
        <span>{formattedDate}</span>

        {review.isVerified && (
          <>
            <span>•</span>
            <div className="flex items-center gap-1 text-emerald-600 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5 fill-current" />
              <span>Verified Purchase</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
