import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { validateCoupon, calculateDiscount } from '../lib/couponUtils';
import { useAuth } from './AuthContext';

const CartContext = createContext({});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('urbanthread_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  useEffect(() => {
    localStorage.setItem('urbanthread_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  // Recalculate discount when cart changes
  useEffect(() => {
    if (appliedCoupon) {
      const { discountAmount } = calculateDiscount(appliedCoupon, cartTotal, cartItems);
      setDiscount(discountAmount);

      // Check if coupon is still valid (e.g., min order value)
      if (appliedCoupon.min_order_value && cartTotal < appliedCoupon.min_order_value) {
        setAppliedCoupon(null);
        setDiscount(0);
        setCouponError('Coupon removed: minimum order value no longer met');
      }

      // Check category match still valid
      if (appliedCoupon.applicable_categories && appliedCoupon.applicable_categories.length > 0) {
        const cartCategories = cartItems.map(item => item.category);
        if (!cartCategories.some(cat => appliedCoupon.applicable_categories.includes(cat))) {
          setAppliedCoupon(null);
          setDiscount(0);
          setCouponError('Coupon removed: no matching items in cart');
        }
      }
    }
  }, [cartItems, cartTotal, appliedCoupon]);

  const finalTotal = Math.max(0, cartTotal - discount);

  const addToCart = (product, quantity = 1, size = null) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.size === size);
      if (existing) {
        return prev.map(item =>
          (item.id === product.id && item.size === size)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, size }];
    });
  };

  const removeFromCart = (productId, size = null) => {
    setCartItems(prev => prev.filter(item => !(item.id === productId && item.size === size)));
  };

  const updateQuantity = (productId, quantity, size = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        (item.id === productId && item.size === size) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponError(null);
  };

  const applyCoupon = useCallback(async (code) => {
    setCouponLoading(true);
    setCouponError(null);

    const result = await validateCoupon(code, cartItems, cartTotal, user?.id);

    if (result.valid) {
      setAppliedCoupon(result.coupon);
      const { discountAmount } = calculateDiscount(result.coupon, cartTotal, cartItems);
      setDiscount(discountAmount);
      setCouponError(null);
    } else {
      setAppliedCoupon(null);
      setDiscount(0);
      setCouponError(result.error);
    }

    setCouponLoading(false);
    return result;
  }, [cartItems, cartTotal, user?.id]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponError(null);
  }, []);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity,
      clearCart, cartTotal, cartCount,
      appliedCoupon, discount, finalTotal,
      applyCoupon, removeCoupon,
      couponLoading, couponError, setCouponError
    }}>
      {children}
    </CartContext.Provider>
  );
}
