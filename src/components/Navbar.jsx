import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Search, Menu, X, Sun, Moon, User, LogOut, Shield, ChevronDown, Package } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import './Navbar.css';

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        const { data } = await supabase
          .from('products')
          .select('id, name, image_url, price, category')
          .or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
          .limit(5);
        setSearchResults(data || []);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Shop' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <span className="logo-urban">URBAN</span>
          <span className="logo-thread">THREAD</span>
        </Link>

        <div className="navbar-links">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'nav-link-active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <div className="search-wrapper" ref={searchRef}>
            <button className="btn-icon nav-action-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
              <Search size={20} />
            </button>
            {searchOpen && (
              <div className="search-dropdown animate-fade-in-down">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map(product => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="search-result-item"
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      >
                        <img src={product.image_url} alt={product.name} className="search-result-img" />
                        <div>
                          <div className="search-result-name">{product.name}</div>
                          <div className="search-result-price">₹{product.price}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="btn-icon nav-action-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user && <NotificationBell />}

          <Link to="/wishlist" className="btn-icon nav-action-btn nav-badge-wrapper" aria-label="Wishlist">
            <Heart size={20} />
            {wishlistItems.length > 0 && <span className="nav-badge">{wishlistItems.length}</span>}
          </Link>

          <Link to="/cart" className="btn-icon nav-action-btn nav-badge-wrapper" aria-label="Cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
          </Link>

          <div className="user-menu-wrapper" ref={userMenuRef}>
            {user ? (
              <>
                <button className="btn-icon nav-action-btn user-avatar-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <User size={20} />
                  <ChevronDown size={14} className={`chevron ${userMenuOpen ? 'chevron-up' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown animate-fade-in-down">
                    <div className="user-dropdown-header">
                      <p className="user-name">{profile?.full_name || 'User'}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link to="/admin" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <Shield size={16} /> Admin Panel
                      </Link>
                    )}
                    <Link to="/orders" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <Package size={16} /> My Orders
                    </Link>
                    <button className="user-dropdown-item" onClick={handleSignOut}>
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm nav-login-btn">
                Login
              </Link>
            )}
          </div>

          <button className="btn-icon nav-action-btn mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-links">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${location.pathname === link.path ? 'mobile-nav-active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          {user && isAdmin && (
            <Link to="/admin" className="mobile-nav-link">
              <Shield size={18} /> Admin Panel
            </Link>
          )}
          {user && (
            <Link to="/orders" className="mobile-nav-link">
              <Package size={18} /> My Orders
            </Link>
          )}
          {!user && (
            <Link to="/login" className="mobile-nav-link mobile-login-link">
              Login / Sign Up
            </Link>
          )}
          {user && (
            <button className="mobile-nav-link mobile-signout" onClick={handleSignOut}>
              <LogOut size={18} /> Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
