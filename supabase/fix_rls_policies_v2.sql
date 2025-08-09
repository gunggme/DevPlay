-- Fix RLS policies for role_requests table
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own role requests" ON public.role_requests;
DROP POLICY IF EXISTS "Users can create own role requests" ON public.role_requests;

-- Create corrected policies
-- The role_requests.user_id references profiles.id, so we need to join properly
CREATE POLICY "Users can view own role requests" ON public.role_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = role_requests.user_id 
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own role requests" ON public.role_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = role_requests.user_id 
      AND profiles.user_id = auth.uid()
    )
  );