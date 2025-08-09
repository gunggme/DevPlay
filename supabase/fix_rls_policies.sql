-- Fix RLS policies for role_requests table
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own role requests" ON public.role_requests;
DROP POLICY IF EXISTS "Users can create own role requests" ON public.role_requests;

-- Create corrected policies
CREATE POLICY "Users can view own role requests" ON public.role_requests
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create own role requests" ON public.role_requests
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );