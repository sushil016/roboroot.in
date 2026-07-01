import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { reviewApi } from "../../services/review.service";

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, title: string, body: string, imageUrl?: string) => Promise<void>;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const stars = [1, 2, 3, 4, 5];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      let uploadedUrl: string | undefined;
      if (selectedFile) {
        uploadedUrl = await reviewApi.uploadReviewImage(selectedFile);
      }
      await onSubmit(rating, title, body, uploadedUrl);
      setTitle("");
      setBody("");
      setRating(5);
      setSelectedFile(null);
      setPreviewUrl(null);
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

          {/* Optional Review Image */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block">
              Add Photo (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="h-14 w-14 shrink-0 rounded-xl border-2 border-dashed border-[#D8D8C4] hover:border-[#1CA2D1] cursor-pointer flex flex-col items-center justify-center text-zinc-400 hover:text-[#1CA2D1] transition-all bg-zinc-50">
                <span className="text-[20px] font-light leading-none">+</span>
                <span className="text-[8px] font-bold uppercase tracking-wider mt-1">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {previewUrl && (
                <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-[#D8D8C4] group">
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
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
