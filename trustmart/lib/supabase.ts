import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)

// Types for our database
export interface Business {
  id: string
  business_name: string
  email: string
  password_hash: string
  created_at: string
  updated_at: string
}

export interface CreateBusinessData {
  business_name: string
  email: string
  password_hash: string
}

export interface Rating {
  id: string
  business_id: string
  rating: number
  review?: string
  reviewer_name?: string
  reviewer_email?: string
  created_at: string
}

export interface BusinessWithRatings extends Business {
  total_ratings: number
  average_rating: number
  ratings: Rating[]
}

// Helper functions for business operations
export const businessService = {
  // Create a new business
  async createBusiness(businessData: CreateBusinessData) {
    const { data, error } = await supabase
      .from('businesses')
      .insert(businessData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get business by email
  async getBusinessByEmail(email: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Get business with ratings
  async getBusinessWithRatings(businessId: string) {
    const { data, error } = await supabase
      .from('business_ratings_summary')
      .select('*')
      .eq('id', businessId)
      .single()
    
    if (error) throw error
    return data
  },

  // Update business
  async updateBusiness(businessId: string, updates: Partial<Business>) {
    const { data, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', businessId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Helper functions for rating operations
export const ratingService = {
  // Create a new rating
  async createRating(ratingData: Omit<Rating, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('ratings')
      .insert(ratingData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get ratings for a business
  async getRatingsForBusiness(businessId: string) {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get all businesses with their ratings
  async getAllBusinessesWithRatings() {
    const { data, error } = await supabase
      .from('business_ratings_summary')
      .select('*')
      .order('business_name')
    
    if (error) throw error
    return data || []
  }
}
