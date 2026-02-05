"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { businessService } from "@/lib/supabase";
import Link from "next/link";

export default function BusinessDetailPage() {
  const [business, setBusiness] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-5 h-5 text-gray-300 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
          </svg>
        );
      }
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
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <Link href="/" className="text-gray-500 hover:text-gray-700">
                      Home
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-sm font-medium text-gray-900">
                        {business?.business_name}
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">{business?.business_name}</h1>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Business Info Card */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  <div className="h-20 w-20 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {business?.business_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{business?.business_name}</h2>
                  <p className="text-sm text-gray-500 mb-2">{business?.email}</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {renderStars(business?.average_rating || 0)}
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {(business?.average_rating || 0).toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({business?.total_ratings || 0} reviews)
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Member since {business ? new Date(business.created_at).toLocaleDateString() : "N/A"}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="flex space-x-4">
                <Link
                  href={`/rate/${businessId}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Rate This Business
                </Link>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/rate/${businessId}`);
                    alert("Rating link copied to clipboard!");
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Share Rating Page
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratings.filter((r) => r.rating === star).length;
                const percentage = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 w-8">{star} ⭐</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Customer Reviews ({ratings.length})
            </h3>
            
            {ratings.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">📝</div>
                <p className="text-gray-500 mb-4">No reviews yet. Be the first to review!</p>
                <Link
                  href={`/rate/${businessId}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Leave a Review
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {ratings.map((rating) => (
                  <div key={rating.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {rating.reviewer_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{rating.reviewer_name}</span>
                          <div className="flex items-center mt-1">
                            {renderStars(rating.rating)}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {rating.review && (
                      <p className="text-gray-600 mt-2">{rating.review}</p>
                    )}
                    {rating.reviewer_email && (
                      <p className="text-sm text-gray-500 mt-1">{rating.reviewer_email}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
