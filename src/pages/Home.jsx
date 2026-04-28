import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Truck, Shield, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import MoodSelector from '../components/MoodSelector';
import { ProductGridSkeleton } from '../components/SkeletonLoader';
import './Home.css';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [moodProducts, setMoodProducts] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moodLoading, setMoodLoading] = useState(false);

  useEffect(() => {
    fetchFeatured();
  }, []);

  useEffect(() => {
    if (selectedMood) fetchMoodProducts(selectedMood);
    else setMoodProducts([]);
  }, [selectedMood]);

  const fetchFeatured = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .limit(4)
      .order('created_at', { ascending: false });
    setFeaturedProducts(data || []);
    setLoading(false);
  };

  const fetchMoodProducts = async (mood) => {
    setMoodLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('mood_tag', mood);
    setMoodProducts(data || []);
    setMoodLoading(false);
  };

  const categories = [
    { name: 'T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80' },
    { name: 'Hoodies', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80' },
    { name: 'Jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80' },
    { name: 'Jackets', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&q=80' },
  ];

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content container">
          <div className="hero-text">
            <div className="hero-badge animate-fade-in-up stagger-1">
              <Sparkles size={14} />
              <span>New Collection 2026</span>
            </div>
            <h1 className="hero-title animate-fade-in-up stagger-2">
              Wear Your <span className="text-accent">Mood.</span><br />
              Own Your <span className="text-accent">Style.</span>
            </h1>
            <p className="hero-subtitle animate-fade-in-up stagger-3">
              Discover streetwear that matches your energy. From bold and confident 
              to chill and relaxed — we've got your vibe covered.
            </p>
            <div className="hero-actions animate-fade-in-up stagger-4">
              <Link to="/products" className="btn btn-primary btn-lg">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/products?mood=Confident" className="btn btn-outline btn-lg">
                Explore Moods
              </Link>
            </div>
            <div className="hero-stats animate-fade-in-up stagger-5">
              <div className="hero-stat">
                <span className="hero-stat-value">200+</span>
                <span className="hero-stat-label">Products</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="hero-stat-value">50K+</span>
                <span className="hero-stat-label">Customers</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="hero-stat-value">4.9</span>
                <span className="hero-stat-label">Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-visual animate-fade-in-up stagger-3">
            <div className="hero-image-card hero-image-1">
              <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80" alt="Fashion model" />
            </div>
            <div className="hero-image-card hero-image-2">
              <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&q=80" alt="Fashion style" />
            </div>
            <div className="hero-floating-tag">
              <TrendingUp size={16} />
              Trending Now
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="features-bar">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <Truck size={24} />
              <div>
                <h4>Free Shipping</h4>
                <p>On orders above ₹999</p>
              </div>
            </div>
            <div className="feature-item">
              <Shield size={24} />
              <div>
                <h4>Secure Payment</h4>
                <p>100% protected</p>
              </div>
            </div>
            <div className="feature-item">
              <RotateCcw size={24} />
              <div>
                <h4>Easy Returns</h4>
                <p>7-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">Find your perfect fit</p>
            </div>
            <Link to="/products" className="btn btn-ghost">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className={`category-card animate-fade-in-up stagger-${i+1}`}
              >
                <img src={cat.image} alt={cat.name} className="category-image" />
                <div className="category-overlay">
                  <h3>{cat.name}</h3>
                  <span>Shop Now →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Our latest drops</p>
            </div>
            <Link to="/products" className="btn btn-ghost">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="products-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mood Section */}
      <section className="section mood-section">
        <div className="container">
          <div className="section-header section-header-center">
            <h2 className="section-title">What's Your Mood Today?</h2>
            <p className="section-subtitle">
              Pick your vibe and we'll find the perfect outfit for you
            </p>
          </div>
          <MoodSelector selectedMood={selectedMood} onMoodSelect={setSelectedMood} />
          
          {selectedMood && (
            <div className="mood-results animate-fade-in-up" style={{ marginTop: 'var(--space-2xl)' }}>
              {moodLoading ? (
                <ProductGridSkeleton count={4} />
              ) : moodProducts.length > 0 ? (
                <div className="products-grid">
                  {moodProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted">No products found for this mood yet.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="section newsletter-section">
        <div className="container">
          <div className="newsletter-card">
            <div className="newsletter-content">
              <h2>Stay in the Loop</h2>
              <p>Get exclusive drops, style tips, and early access to new collections.</p>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Enter your email" className="form-input newsletter-input" />
                <button type="submit" className="btn btn-primary">Subscribe</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
