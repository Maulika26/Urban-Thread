import { useState } from 'react';
import { MapPin, Mail, Phone, Send, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    await supabase.from('contact_messages').insert(form);
    
    setSent(true);
    setLoading(false);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="contact-page page-enter">
      <div className="contact-hero">
        <div className="container">
          <h1 className="contact-hero-title">Get in Touch</h1>
          <p className="contact-hero-subtitle">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="contact-layout">
          <div className="contact-info-section">
            <h2>Contact Information</h2>
            <p className="contact-info-desc">
              Reach out to us through any of these channels. We typically respond within 24 hours.
            </p>

            <div className="contact-info-cards">
              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3>Visit Us</h3>
                  <p>123, MG Road, Bengaluru<br />Karnataka 560001, India</p>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <Mail size={22} />
                </div>
                <div>
                  <h3>Email Us</h3>
                  <p>hello@urbanthread.in<br />support@urbanthread.in</p>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <Phone size={22} />
                </div>
                <div>
                  <h3>Call Us</h3>
                  <p>+91 98765 43210<br />Mon-Sat, 10AM - 7PM</p>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <Clock size={22} />
                </div>
                <div>
                  <h3>Working Hours</h3>
                  <p>Monday - Saturday<br />10:00 AM - 7:00 PM IST</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <div className="contact-form-card">
              <h2>Send a Message</h2>

              {sent && (
                <div className="contact-success animate-scale-in">
                  <CheckCircle size={20} />
                  Message sent successfully! We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Your Name *</label>
                    <input type="text" name="name" className="form-input" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input type="email" name="email" className="form-input" value={form.email} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input type="text" name="subject" className="form-input" value={form.subject} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea name="message" className="form-input" rows="5" value={form.message} onChange={handleChange} required></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  <Send size={16} />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
