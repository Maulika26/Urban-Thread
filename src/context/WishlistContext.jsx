import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const WishlistContext = createContext({});

export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('urbanthread_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('urbanthread_wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, user]);

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('wishlist')
        .select('product_id, products(*)')
        .eq('user_id', user.id);
      
      if (data) {
        setWishlistItems(data.map(item => item.products).filter(Boolean));
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  };

  const addToWishlist = async (product) => {
    if (wishlistItems.find(item => item.id === product.id)) return;
    
    setWishlistItems(prev => [...prev, product]);

    if (user) {
      await supabase.from('wishlist').insert({
        user_id: user.id,
        product_id: product.id
      });
    }
  };

  const removeFromWishlist = async (productId) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));

    if (user) {
      await supabase.from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems, addToWishlist, removeFromWishlist, isInWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}
