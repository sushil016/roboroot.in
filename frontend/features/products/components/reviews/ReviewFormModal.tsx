import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, title: string, body: string) => Promise<void>;
  productName: string;
}

export function ReviewFormModal({
  isOpen,
  onClose,
  onSubmit,
  productName,
}: ReviewFormModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const stars = [1, 2, 3, 4, 5];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(rating, title, body);
      setTitle("");
      setBody("");
      setRating(5);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl border border-[#D8D8C4] shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-[#222222]">
              Rate & Review Product
            </h3>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide truncate max-w-[280px] sm:max-w-sm mt-0.5">
              {productName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          {/* Star Selector */}
          <div className="space-y-2 text-center py-2 bg-zinc-50 rounded-2xl border border-zinc-100">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
              Tap to Rate
            </label>
            <div className="flex justify-center gap-2">
              {stars.map((star) => {
                const active = hoverRating !== null ? star <= hoverRating : star <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        active 
                          ? "fill-amber-400 text-amber-400" 
                          : "text-zinc-300 fill-transparent"
                      )}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-zinc-400 block mt-1">
              {rating === 5 && "Excellent! ❤️"}
              {rating === 4 && "Very Good! 👍"}
              {rating === 3 && "Good! 🙂"}
              {rating === 2 && "Fair! 😐"}
              {rating === 1 && "Poor! 😞"}
            </span>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
              Review Title (Optional)
            </label>
            <input
              type="text"
              placeholder="Summarize your experience..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-4 text-sm border border-[#D8D8C4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CA2D1]/20 focus:border-[#1CA2D1] transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
              Write Review (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="What did you like or dislike? How is the quality?"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-4 text-sm border border-[#D8D8C4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CA2D1]/20 focus:border-[#1CA2D1] transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 border border-zinc-200 hover:bg-zinc-50 font-bold text-xs text-zinc-600 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 bg-[#222222] hover:bg-[#1CA2D1] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
