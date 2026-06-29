import React from "react";
import { Star } from "lucide-react";

interface RatingBreakdownProps {
  averageRating: number;
  reviewCount: number;
  breakdown: Record<number, number>;
}

export function RatingBreakdown({
  averageRating,
  reviewCount,
  breakdown,
}: RatingBreakdownProps) {
  const totalRatings = Object.values(breakdown).reduce((a, b) => a + b, 0) || reviewCount || 1;

  // Star levels from 5 down to 1
  const stars = [5, 4, 3, 2, 1];

  // Helper to get color of progress bar based on star level (Flipkart style)
  const getBarColor = (star: number) => {
    if (star >= 4) return "bg-emerald-600"; // Green for 4-5 stars
    if (star === 3) return "bg-green-500";   // Lighter green/yellow-green for 3 stars
    if (star === 2) return "bg-amber-500";   // Amber for 2 stars
    return "bg-orange-600";                  // Orange/Red for 1 star
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#D8D8C4] shadow-xs space-y-6">
      <div className="flex items-center gap-6">
        <div className="text-center shrink-0">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-black text-[#222222]">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-zinc-400 text-sm font-semibold">/5</span>
          </div>
          <div className="mt-2 flex items-center justify-center gap-0.5 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
            <span>★</span>
            <span>Overall</span>
          </div>
          <p className="mt-2 text-xs text-zinc-500 font-semibold">
            {reviewCount} {reviewCount === 1 ? "Rating" : "Ratings"}
          </p>
        </div>

        <div className="flex-1 space-y-2.5">
          {stars.map((star) => {
            const count = breakdown[star] || 0;
            const percentage = Math.round((count / totalRatings) * 100);

            return (
              <div key={star} className="flex items-center gap-2.5 text-xs sm:text-sm">
                <span className="w-3 text-right font-bold text-zinc-600">{star}</span>
                <Star className="h-3 w-3 fill-zinc-400 text-zinc-400 shrink-0" />
                
                {/* Progress bar container */}
                <div className="h-1.5 flex-1 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getBarColor(star)} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="w-8 text-right font-semibold text-zinc-400">{percentage}%</span>
                <span className="w-8 text-right text-zinc-500 font-medium">({count})</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
