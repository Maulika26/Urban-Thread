import { Link } from 'react-router-dom';
import { Globe, ExternalLink, Share2, Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="logo-urban">URBAN</span>
            <span className="logo-thread">THREAD</span>
          </Link>
          <p className="footer-tagline">
            Redefining streetwear for the modern generation. Express yourself, wear your mood.
          </p>
          <div className="footer-socials">
            <a href="https://wa.me/qr/I24XGIDK676VC1" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="WhatsApp"><MessageCircle size={20} /></a>
            <a href="#" className="social-link" aria-label="Website"><Globe size={20} /></a>
            <a href="#" className="social-link" aria-label="Share"><Share2 size={20} /></a>
            <a href="#" className="social-link" aria-label="Link"><ExternalLink size={20} /></a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-heading">Shop</h4>
          <Link to="/products" className="footer-link">All Products</Link>
          <Link to="/products?category=T-Shirts" className="footer-link">T-Shirts</Link>
          <Link to="/products?category=Hoodies" className="footer-link">Hoodies</Link>
          <Link to="/products?category=Jeans" className="footer-link">Jeans</Link>
          <Link to="/products?category=Jackets" className="footer-link">Jackets</Link>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-heading">Company</h4>
          <Link to="/contact" className="footer-link">Contact Us</Link>
          <Link to="/about" className="footer-link">About Us</Link>
          <Link to="/" className="footer-link">Careers</Link>
          <Link to="/" className="footer-link">Press</Link>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-heading">Contact</h4>
          <div className="footer-contact-item">
            <MapPin size={16} />
            <span>123, MG Road, Bengaluru, India</span>
          </div>
          <div className="footer-contact-item">
            <Mail size={16} />
            <span>hello@urbanthread.in</span>
          </div>
          <div className="footer-contact-item">
            <Phone size={16} />
            <span>+91 98765 43210</span>
          </div>
          <a href="https://wa.me/qr/I24XGIDK676VC1" target="_blank" rel="noopener noreferrer" className="footer-contact-item" style={{ color: 'var(--success)' }}>
            <MessageCircle size={16} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      <div className="footer-bottom container">
        <p>&copy; {new Date().getFullYear()} UrbanThread. All rights reserved.</p>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
