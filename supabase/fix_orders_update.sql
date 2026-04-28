-- ============================================
-- UrbanThread - Add UPDATE policy for orders
-- Run this in Supabase SQL Editor
-- ============================================

-- Allow admins to update order status
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (public.is_admin());
