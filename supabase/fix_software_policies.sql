-- Fix Software table RLS policies
-- Run this in Supabase SQL Editor

-- 1. Enable RLS if not already enabled
ALTER TABLE public.softwares ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to recreate them correctly
DROP POLICY IF EXISTS "Softwares are viewable by everyone" ON public.softwares;
DROP POLICY IF EXISTS "Developers can create software" ON public.softwares;
DROP POLICY IF EXISTS "Software owners can update" ON public.softwares;
DROP POLICY IF EXISTS "Software owners can delete" ON public.softwares;

-- 3. Create corrected policies

-- Everyone can view softwares (including non-authenticated users)
CREATE POLICY "Anyone can view softwares" 
  ON public.softwares 
  FOR SELECT 
  USING (true);

-- Developers and admins can create software
CREATE POLICY "Developers can create software" 
  ON public.softwares 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('developer', 'admin')
    )
  );

-- Software owners can update their own software
CREATE POLICY "Software owners can update" 
  ON public.softwares 
  FOR UPDATE 
  USING (
    developer_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Software owners can delete their own software
CREATE POLICY "Software owners can delete" 
  ON public.softwares 
  FOR DELETE 
  USING (
    developer_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- 4. Test the policies
-- Run these queries to verify the policies are working

-- Check if softwares table is accessible
SELECT COUNT(*) FROM public.softwares;

-- Check current user's profile
SELECT * FROM public.profiles WHERE user_id = auth.uid();

-- Check if current user can see softwares
SELECT * FROM public.softwares LIMIT 5;