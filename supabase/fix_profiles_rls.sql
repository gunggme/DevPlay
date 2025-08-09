-- Fix profiles RLS policy to allow admin role updates
-- Run this in Supabase SQL Editor

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create new update policy that allows users to update their own profiles
-- AND allows admins to update any profile
CREATE POLICY "Users can update own profile OR admins can update any profile" 
  ON public.profiles FOR UPDATE 
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );