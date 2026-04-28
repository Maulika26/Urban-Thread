import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './Wishlist.css';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page page-enter">
        <div className="container">
          <div className="empty-state">
            <Heart size={64} />
            <h3>Your wishlist is empty</h3>
            <p>Save the items you love to find them easily later.</p>
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page page-enter">
      <div className="container">
        <h1 className="wishlist-title">My Wishlist</h1>
        <span className="wishlist-count">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</span>

        <div className="wishlist-grid">
          {wishlistItems.map(item => (
            <div key={item.id} className="wishlist-card">
              <Link to={`/product/${item.id}`} className="wishlist-card-image">
                <img src={item.image_url} alt={item.name} />
              </Link>
              <div className="wishlist-card-info">
                <Link to={`/product/${item.id}`}>
                  <h3 className="wishlist-card-name">{item.name}</h3>
                </Link>
                <span className="wishlist-card-category">{item.category}</span>
                <div className="wishlist-card-price">₹{item.price?.toLocaleString('en-IN')}</div>
                <div className="wishlist-card-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleMoveToCart(item)}>
                    <ShoppingCart size={14} /> Move to Cart
                  </button>
                  <button className="btn btn-ghost btn-sm wishlist-remove" onClick={() => removeFromWishlist(item.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
