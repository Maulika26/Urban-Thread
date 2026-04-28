import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Heart, Truck, RotateCcw, Shield, ArrowLeft, Star, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { ProductDetailSkeleton } from '../components/SkeletonLoader';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setQuantity(1);
    setSelectedSize(null);
    setSizeError(false);
    setAddedToCart(false);

    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    setProduct(data);

    if (data) {
      const { data: related } = await supabase
        .from('products')
        .select('*')
        .eq('mood_tag', data.mood_tag)
        .neq('id', data.id)
        .limit(4);
      setRelatedProducts(related || []);
    }

    setLoading(false);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles:user_id (full_name)
      `)
      .eq('product_id', id)
      .order('created_at', { ascending: false });

    if (data) {
      setReviews(data);
      const total = data.reduce((sum, r) => sum + r.rating, 0);
      setAvgRating(data.length > 0 ? (total / data.length).toFixed(1) : 0);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError(false);
      setTimeout(() => setSizeError(true), 10);
      return;
    }

    addToCart(product, quantity, selectedSize);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const wishlisted = product ? isInWishlist(product.id) : false;

  const handleWishlist = () => {
    if (!product) return;
    wishlisted ? removeFromWishlist(product.id) : addToWishlist(product);
  };

  const moodClass = product?.mood_tag?.toLowerCase();

  if (loading) {
    return (
      <div className="product-detail-page page-enter">
        <div className="container">
          <ProductDetailSkeleton />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page page-enter">
        <div className="container">
          <div className="empty-state">
            <h3>Product not found</h3>
            <p>The product you're looking for doesn't exist.</p>
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page page-enter">
      <div className="container">
        <Link to="/products" className="back-link">
          <ArrowLeft size={18} /> Back to Shop
        </Link>

        <div className="product-detail-grid">
          <div className="product-detail-image">
            <img src={product.image_url} alt={product.name} />
            {product.mood_tag && (
              <span className={`badge badge-${moodClass} detail-mood-badge`}>
                {product.mood_tag}
              </span>
            )}
          </div>

          <div className="product-detail-info">
            <span className="product-detail-category">{product.category}</span>
            <h1 className="product-detail-name">{product.name}</h1>
            <div className="product-detail-price">₹{product.price?.toLocaleString('en-IN')}</div>

            {reviews.length > 0 && (
              <div className="product-detail-rating" onClick={() => document.getElementById('reviews-section').scrollIntoView({behavior: 'smooth'})}>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={16} fill={s <= Math.round(avgRating) ? "var(--accent)" : "none"} color={s <= Math.round(avgRating) ? "var(--accent)" : "currentColor"} />
                  ))}
                </div>
                <span className="rating-text">{avgRating} ({reviews.length} reviews)</span>
              </div>
            )}

            <p className="product-detail-desc">{product.description}</p>

            <div className="product-detail-stock">
              {product.stock > 0 ? (
                <span className="stock-available">✓ In Stock ({product.stock} available)</span>
              ) : (
                <span className="stock-out">✗ Out of Stock</span>
              )}
            </div>

            {product.stock > 0 && (
              <>
                {product.sizes && product.sizes.length > 0 && (
                  <div className={`size-selector ${sizeError ? 'size-error-shake' : ''}`}>
                    <div className="size-header">
                      <span className="quantity-label">Select Size:</span>
                      {sizeError && <span className="size-error-text">Please select a size to continue</span>}
                    </div>
                    <div className="size-options">
                      {product.sizes.map(size => (
                        <button
                          key={size}
                          className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedSize(size);
                            setSizeError(false);
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="quantity-selector">
                  <span className="quantity-label">Quantity:</span>
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="quantity-value">{quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="product-detail-actions">
                  <button
                    className={`btn btn-primary btn-lg flex-1 ${addedToCart ? 'btn-success' : ''}`}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart size={18} />
                    {addedToCart ? 'Added to Cart! ✓' : 'Add to Cart'}
                  </button>
                  <button
                    className={`btn btn-secondary btn-icon btn-lg ${wishlisted ? 'wishlisted-btn' : ''}`}
                    onClick={handleWishlist}
                    aria-label="Wishlist"
                  >
                    <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </>
            )}

            <div className="product-perks">
              <div className="perk-item">
                <Truck size={18} />
                <span>Free shipping on all orders</span>
              </div>
              <div className="perk-item">
                <RotateCcw size={18} />
                <span>7-day easy returns</span>
              </div>
              <div className="perk-item">
                <Shield size={18} />
                <span>Secure checkout with Razorpay</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div id="reviews-section" className="product-reviews-section">
          <div className="reviews-header">
            <h2 className="section-title">Customer Reviews</h2>
            {reviews.length > 0 && (
              <div className="avg-rating-big">
                <span className="rating-num">{avgRating}</span>
                <div className="rating-info">
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={18} fill={s <= Math.round(avgRating) ? "var(--accent)" : "none"} color={s <= Math.round(avgRating) ? "var(--accent)" : "currentColor"} />
                    ))}
                  </div>
                  <span>Based on {reviews.length} reviews</span>
                </div>
              </div>
            )}
          </div>

          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-user">
                    <div className="user-avatar">
                      <User size={20} />
                    </div>
                    <div className="user-info">
                      <span className="user-name">{review.profiles?.full_name || 'Anonymous'}</span>
                      <span className="review-date">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="review-stars">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} fill={s <= review.rating ? "var(--accent)" : "none"} color={s <= review.rating ? "var(--accent)" : "currentColor"} />
                    ))}
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="no-reviews">
                <p>No reviews yet for this product. Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="related-section">
            <h2 className="section-title">You Might Also Like</h2>
            <div className="products-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
