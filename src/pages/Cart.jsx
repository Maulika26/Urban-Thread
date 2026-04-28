import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page page-enter">
        <div className="container">
          <div className="empty-state">
            <ShoppingBag size={64} />
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet. Start exploring!</p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page-enter">
      <div className="container">
        <h1 className="cart-title">Shopping Cart</h1>
        <span className="cart-count-label">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>

        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={`${item.id}-${item.size}`} className="cart-item">
                <Link to={`/product/${item.id}`} className="cart-item-image">
                  <img src={item.image_url} alt={item.name} />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                  <div className="cart-item-meta">
                    <span className="cart-item-category">{item.category}</span>
                    {item.size && <span className="cart-item-size-badge">Size: {item.size}</span>}
                  </div>
                  <div className="cart-item-price-mobile">₹{item.price?.toLocaleString('en-IN')}</div>
                </div>
                <div className="cart-item-quantity">
                  <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}>
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}>
                    <Plus size={14} />
                  </button>
                </div>
                <div className="cart-item-price">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
                <button className="cart-item-remove" onClick={() => removeFromCart(item.id, item.size)}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-lg w-full">
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
            <Link to="/products" className="btn btn-ghost w-full">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
