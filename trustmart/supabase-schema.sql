-- TrustMart Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create businesses table
CREATE TABLE businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  reviewer_name VARCHAR(255),
  reviewer_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_businesses_email ON businesses(email);
CREATE INDEX idx_ratings_business_id ON ratings(business_id);
CREATE INDEX idx_ratings_created_at ON ratings(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_businesses_updated_at 
    BEFORE UPDATE ON businesses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses table
-- Anyone can view businesses (public access for listing)
CREATE POLICY "Anyone can view businesses" ON businesses
    FOR SELECT USING (true);

-- Anyone can insert businesses (public signup)
CREATE POLICY "Anyone can insert businesses" ON businesses
    FOR INSERT WITH CHECK (true);

-- Users can only update their own business (requires authentication)
CREATE POLICY "Users can update own business" ON businesses
    FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for ratings table
-- Anyone can view ratings (public access)
CREATE POLICY "Anyone can view ratings" ON ratings
    FOR SELECT USING (true);

-- Anyone can insert ratings (public access)
CREATE POLICY "Anyone can insert ratings" ON ratings
    FOR INSERT WITH CHECK (true);

-- Create a view for business ratings summary
CREATE VIEW business_ratings_summary AS
SELECT 
    b.id,
    b.business_name,
    b.email,
    b.created_at,
    COUNT(r.id) as total_ratings,
    COALESCE(AVG(r.rating), 0) as average_rating,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', r.id,
                'rating', r.rating,
                'review', r.review,
                'reviewer_name', r.reviewer_name,
                'reviewer_email', r.reviewer_email,
                'created_at', r.created_at
            )
        ) FILTER (WHERE r.id IS NOT NULL), 
        '[]'::json
    ) as ratings
FROM businesses b
LEFT JOIN ratings r ON b.id = r.business_id
GROUP BY b.id, b.business_name, b.email, b.created_at;

-- Create a function to get business by email
CREATE OR REPLACE FUNCTION get_business_by_email(business_email VARCHAR(255))
RETURNS TABLE (
    id UUID,
    business_name VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.business_name,
        b.email,
        b.created_at,
        b.updated_at
    FROM businesses b
    WHERE b.email = business_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
