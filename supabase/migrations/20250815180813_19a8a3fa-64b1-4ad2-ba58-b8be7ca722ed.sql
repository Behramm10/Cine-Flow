-- Fix security issues

-- 1. Fix user profile information exposure
-- Replace the overly permissive "Profiles are viewable by everyone" policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a more secure policy that only allows users to view their own profiles
-- Or allows public viewing of only limited, non-sensitive profile information
CREATE POLICY "Users can view their own profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Optional: If you want to allow limited public profile information (like display names for public features)
-- You can create a separate policy for specific columns or use a function
-- For now, keeping it restricted to authenticated users viewing their own profiles

-- 2. Enable password strength requirements and leaked password protection
-- Note: Some auth configurations need to be set via Supabase dashboard, but we can set what's available via SQL

-- Enable password strength requirements if available via SQL
-- (Most auth config is done via dashboard, but checking if any SQL options exist)

-- Update auth configuration if possible via SQL
-- Note: OTP expiry and leaked password protection are typically configured in Supabase dashboard
-- under Authentication > Settings, but documenting here for reference