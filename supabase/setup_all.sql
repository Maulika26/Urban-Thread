-- ============================================
-- UrbanThread COMPLETE Setup Script
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- ===== 1. CREATE TABLES =====

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  mood_tag TEXT NOT NULL CHECK (mood_tag IN ('Confident', 'Relaxed', 'Energetic')),
  price NUMERIC NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_id TEXT,
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 2. ENABLE ROW LEVEL SECURITY =====
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- ===== 3. RLS POLICIES =====

-- Products: anyone can read
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Products: admins can do everything
DROP POLICY IF EXISTS "Products are editable by admins" ON products;
CREATE POLICY "Products are editable by admins" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Profiles: users can view own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Profiles: users can update own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Profiles: users can insert own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Wishlist: users manage their own
DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlist;
CREATE POLICY "Users can manage own wishlist" ON wishlist
  FOR ALL USING (auth.uid() = user_id);

-- Orders: users can view own orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Contact messages: anyone can insert
DROP POLICY IF EXISTS "Anyone can send contact message" ON contact_messages;
CREATE POLICY "Anyone can send contact message" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Admins can view contact messages
DROP POLICY IF EXISTS "Admins can view contact messages" ON contact_messages;
CREATE POLICY "Admins can view contact messages" ON contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ===== 4. AUTO-CREATE PROFILE ON SIGNUP =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== 5. SEED PRODUCTS =====
INSERT INTO products (id, name, category, mood_tag, price, stock, description, image_url) VALUES
('UT001', 'Classic Black Hoodie', 'Hoodies', 'Relaxed', 1499, 50, 'Comfortable black hoodie for everyday wear. Made with premium cotton blend fabric that keeps you cozy all day long.', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80'),
('UT002', 'Blue Street Denim Jacket', 'Jackets', 'Confident', 2499, 30, 'Stylish denim jacket with urban vibe. Perfect for layering and making a bold statement on the streets.', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80'),
('UT003', 'White Minimal T-Shirt', 'T-Shirts', 'Relaxed', 799, 100, 'Soft cotton minimal white tee. The ultimate wardrobe essential with a clean, modern cut.', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'),
('UT004', 'Urban Cargo Pants', 'Pants', 'Energetic', 1799, 40, 'Trendy cargo pants with multiple pockets. Built for movement and style with durable ripstop fabric.', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80'),
('UT005', 'Sporty Track Set', 'Sets', 'Energetic', 2299, 25, 'Comfortable sporty outfit for active days. Moisture-wicking fabric keeps you fresh during workouts.', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80'),
('UT006', 'Casual Checked Shirt', 'Shirts', 'Relaxed', 1299, 60, 'Lightweight checked shirt for casual outings. Breathable fabric perfect for weekend vibes.', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80'),
('UT007', 'Slim Fit Black Jeans', 'Jeans', 'Confident', 1999, 45, 'Perfect fit black jeans for a stylish look. Stretch denim for comfort without compromising on style.', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80'),
('UT008', 'Graphic Print Tee', 'T-Shirts', 'Energetic', 999, 70, 'Bold graphic t-shirt for statement style. Express yourself with unique urban-inspired artwork.', 'https://images.unsplash.com/photo-1503341504253-dff4f37b0280?w=600&q=80'),
('UT009', 'Formal Blazer', 'Blazers', 'Confident', 2999, 20, 'Elegant blazer for special occasions. Tailored fit with premium fabric for a sophisticated look.', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80'),
('UT010', 'Oversized Hoodie', 'Hoodies', 'Relaxed', 1599, 35, 'Trendy oversized hoodie for comfort wear. Extra roomy fit with soft fleece lining for maximum relaxation.', 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=600&q=80')
ON CONFLICT (id) DO NOTHING;

-- ===== 6. CREATE PROFILE FOR EXISTING USER & SET AS ADMIN =====
INSERT INTO profiles (id, full_name, role)
SELECT id, raw_user_meta_data->>'full_name', 'admin'
FROM auth.users
WHERE email = 'g.maulikasri@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- ===== 7. ENABLE REALTIME =====
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE products;
EXCEPTION WHEN duplicate_object THEN
  -- already added, ignore
END;
$$;
