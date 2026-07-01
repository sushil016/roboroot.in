import api from "@/lib/api-client";

export interface ReviewUser {
  name: string | null;
  avatarUrl: string | null;
}

export interface Review {
  id: string;
  userId: string;
  componentId: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  imageUrl: string | null;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
}

export interface ComponentReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  averageRating: number;
  reviewCount: number;
  breakdown: Record<number, number>;
}

export const reviewApi = {
  /**
   * Fetch approved reviews and rating stats for a component
   */
  getReviews: async (
    componentId: string,
    page = 1,
    limit = 10,
  ): Promise<ComponentReviewsResponse> => {
    const res = await api.get(`/api/components/${componentId}/reviews?page=${page}&limit=${limit}`);
    return res.data.data;
  },

  /**
   * Submit a new review for a component
   */
  submitReview: async (
    componentId: string,
    rating: number,
    title?: string,
    body?: string,
    imageUrl?: string,
  ): Promise<Review> => {
    const res = await api.post("/api/reviews", {
      componentId,
      rating,
      title: title || undefined,
      body: body || undefined,
      imageUrl: imageUrl || undefined,
    });
    return res.data.data;
  },

  /**
   * Upload an image for a review
   */
  uploadReviewImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post("/api/reviews/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.url;
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/api/reviews/${reviewId}`);
  },
};
