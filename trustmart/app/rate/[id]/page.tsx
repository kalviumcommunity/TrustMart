"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { businessService, ratingService } from "@/lib/supabase";
import Link from "next/link";

export default function RatingPage() {
  const [business, setBusiness] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Form state
  const [rating, setRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [review, setReview] = useState("");
  
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;

  useEffect(() => {
    fetchBusinessData();
  }, [businessId]);

  const fetchBusinessData = async () => {
    try {
      const businessData = await businessService.getBusinessWithRatings(businessId);
      
      if (!businessData) {
        setError("Business not found");
        return;
      }
      
      setBusiness(businessData);
      setRatings(businessData.ratings || []);
    } catch (error) {
      console.error("Error fetching business:", error);
      setError("Failed to load business information");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    
    if (!reviewerName.trim()) {
      setError("Please enter your name");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      await ratingService.createRating({
        business_id: businessId,
        rating,
        review: review.trim() || undefined,
        reviewer_name: reviewerName.trim(),
        reviewer_email: reviewerEmail.trim() || undefined
      });

      // Reset form
      setRating(0);
      setReviewerName("");
      setReviewerEmail("");
      setReview("");
      setSuccessMessage("Thank you for your rating!");
      
      // Refresh ratings
      await fetchBusinessData();
    } catch (error) {
      console.error("Error submitting rating:", error);
      setError("Failed to submit rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const filled = i <= rating;
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => interactive && setRating(i)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          disabled={!interactive}
        >
          <svg 
            className={`w-8 h-8 ${filled ? 'text-yellow-400' : 'text-gray-300'} fill-current`} 
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
          </svg>
        </button>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business...</p>
        </div>
      </main>
    );
  }

  if (error && !business) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rate Business</h1>
              <p className="mt-1 text-sm text-gray-600">
                Share your experience with {business?.business_name}
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Business Info */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  <div className="h-16 w-16 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {business?.business_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{business?.business_name}</h2>
                  <p className="text-sm text-gray-500">{business?.email}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center">
                      {renderStars(business?.average_rating || 0)}
                    </div>
                    <span className="text-lg font-medium text-gray-900">
                      {(business?.average_rating || 0).toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({business?.total_ratings || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 py-6 sm:px-0">
          {/* Rating Form */}
          <div>
            <div className="bg-white shadow sm:rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Leave a Review</h3>
              
              {successMessage && (
                <div className="rounded-md bg-green-50 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Success!</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>{successMessage}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitRating} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating *
                  </label>
                  <div className="flex space-x-2">
                    {renderStars(rating, true)}
                  </div>
                </div>

                <div>
                  <label htmlFor="reviewerName" className="block text-sm font-medium text-gray-700">
                    Your Name *
                  </label>
                  <input
                    id="reviewerName"
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label htmlFor="reviewerEmail" className="block text-sm font-medium text-gray-700">
                    Your Email (optional)
                  </label>
                  <input
                    id="reviewerEmail"
                    type="email"
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="review" className="block text-sm font-medium text-gray-700">
                    Your Review (optional)
                  </label>
                  <textarea
                    id="review"
                    rows={4}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Share your experience with this business..."
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Existing Reviews */}
          <div>
            <div className="bg-white shadow sm:rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Customer Reviews ({ratings.length})
              </h3>
              
              {ratings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">📝</div>
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {ratings.map((rating) => (
                    <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{rating.reviewer_name}</span>
                          <div className="flex items-center">
                            {renderStars(rating.rating)}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {rating.review && (
                        <p className="text-gray-600 text-sm">{rating.review}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
