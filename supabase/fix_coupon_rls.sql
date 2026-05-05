-- Fix RLS policy for coupons to explicitly include WITH CHECK for inserts
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;

CREATE POLICY "Admins can manage coupons" ON coupons
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
