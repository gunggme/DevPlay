-- Fix notifications RLS policy to allow system triggers to insert
-- Run this in Supabase SQL Editor

-- Add INSERT policy for notifications table to allow system/trigger operations
CREATE POLICY "System can create notifications" 
  ON public.notifications FOR INSERT 
  WITH CHECK (true);

-- Alternative more secure approach: Allow insert when user_id matches a valid profile
-- This ensures notifications can only be created for existing users
-- DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
-- CREATE POLICY "System can create notifications for valid users" 
--   ON public.notifications FOR INSERT 
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM public.profiles 
--       WHERE id = notifications.user_id
--     )
--   );