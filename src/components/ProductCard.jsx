import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    wishlisted ? removeFromWishlist(product.id) : addToWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const moodClass = product.mood_tag?.toLowerCase();

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card-image-wrapper">
        <img
          src={product.image_url}
          alt={product.name}
          className="product-card-image"
          loading="lazy"
        />
        <div className="product-card-overlay">
          <button className="product-action-btn" onClick={handleAddToCart} aria-label="Add to cart">
            <ShoppingCart size={18} />
          </button>
          <Link to={`/product/${product.id}`} className="product-action-btn" aria-label="View product">
            <Eye size={18} />
          </Link>
        </div>
        <button
          className={`product-wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
        {product.mood_tag && (
          <span className={`badge badge-${moodClass} product-mood-badge`}>
            {product.mood_tag}
          </span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="product-low-stock">Only {product.stock} left</span>
        )}
        {product.stock === 0 && (
          <span className="product-out-of-stock">Out of Stock</span>
        )}
      </div>
      <div className="product-card-info">
        <span className="product-card-category">{product.category}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-price">₹{product.price?.toLocaleString('en-IN')}</div>
      </div>
    </Link>
  );
}
