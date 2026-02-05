"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Search, Filter } from "lucide-react";
import Link from "next/link";
import { ratingService, BusinessWithRatings } from "@/lib/supabase";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessWithRatings[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBusinesses, setFilteredBusinesses] = useState<BusinessWithRatings[]>([]);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    const filtered = businesses.filter(business =>
      business.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBusinesses(filtered);
  }, [searchTerm, businesses]);

  const fetchBusinesses = async () => {
    try {
      const data = await ratingService.getAllBusinessesWithRatings();
      setBusinesses(data);
      setFilteredBusinesses(data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
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
          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
          </svg>
        );
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading businesses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Discover Businesses
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Find and review trusted businesses in your area
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search businesses by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Businesses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredBusinesses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? "No businesses found" : "No businesses registered yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm ? "Try adjusting your search terms" : "Be the first to register your business!"}
            </p>
            {!searchTerm && (
              <Link
                href="/signup"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full hover:scale-105 transition-transform"
              >
                Register Your Business
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBusinesses.map((business, index) => (
              <motion.div
                key={business.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  {/* Business Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {business.business_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {business.business_name}
                        </h3>
                        <p className="text-sm text-gray-400">{business.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {renderStars(business.average_rating || 0)}
                    </div>
                    <span className="text-white font-medium">
                      {(business.average_rating || 0).toFixed(1)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      ({business.total_ratings || 0} reviews)
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    Trusted business serving customers with excellence and dedication.
                  </p>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Link
                      href={`/business/${business.id}`}
                      className="flex-1 text-center px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-medium hover:bg-white/20 transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/rate/${business.id}`}
                      className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white text-sm font-medium hover:scale-105 transition-transform"
                    >
                      Rate Business
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-t from-slate-800 to-slate-900 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">
                {businesses.length}
              </div>
              <div className="text-sm text-gray-400">Total Businesses</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">
                {businesses.reduce((acc, b) => acc + (b.total_ratings || 0), 0)}
              </div>
              <div className="text-sm text-gray-400">Total Reviews</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">
                {businesses.length > 0 
                  ? (businesses.reduce((acc, b) => acc + (b.average_rating || 0), 0) / businesses.length).toFixed(1)
                  : "0.0"
                }
              </div>
              <div className="text-sm text-gray-400">Avg Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-sm text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
