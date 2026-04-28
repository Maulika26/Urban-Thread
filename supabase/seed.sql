-- UrbanThread Seed Data
-- Run this in Supabase SQL Editor after schema.sql

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
