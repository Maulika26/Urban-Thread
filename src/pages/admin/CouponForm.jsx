import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './AdminCoupons.css';

const CATEGORIES = ['T-Shirts', 'Hoodies', 'Jeans', 'Jackets', 'Pants', 'Shirts', 'Sets', 'Blazers'];

const defaultForm = {
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order_value: '',
  max_discount: '',
  applicable_categories: [],
  expiry_date: '',
  total_usage_limit: '',
  per_user_limit: '1',
  status: 'active',
};

export default function CouponForm({ coupon, onSave, onClose }) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (coupon) {
      setForm({
        code: coupon.code || '',
        discount_type: coupon.discount_type || 'percentage',
        discount_value: coupon.discount_value?.toString() || '',
        min_order_value: coupon.min_order_value?.toString() || '',
        max_discount: coupon.max_discount?.toString() || '',
        applicable_categories: coupon.applicable_categories || [],
        expiry_date: coupon.expiry_date ? new Date(coupon.expiry_date).toISOString().slice(0, 16) : '',
        total_usage_limit: coupon.total_usage_limit?.toString() || '',
        per_user_limit: coupon.per_user_limit?.toString() || '1',
        status: coupon.status || 'active',
      });
    }
  }, [coupon]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const toggleCategory = (cat) => {
    setForm(prev => ({
      ...prev,
      applicable_categories: prev.applicable_categories.includes(cat)
        ? prev.applicable_categories.filter(c => c !== cat)
        : [...prev.applicable_categories, cat]
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.code.trim()) newErrors.code = 'Code is required';
    if (!form.discount_value || parseFloat(form.discount_value) <= 0) {
      newErrors.discount_value = 'Enter a valid discount value';
    }
    if (form.discount_type === 'percentage' && parseFloat(form.discount_value) > 100) {
      newErrors.discount_value = 'Percentage cannot exceed 100';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order_value: form.min_order_value ? parseFloat(form.min_order_value) : 0,
      max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
      applicable_categories: form.applicable_categories,
      expiry_date: form.expiry_date ? new Date(form.expiry_date).toISOString() : null,
      total_usage_limit: form.total_usage_limit ? parseInt(form.total_usage_limit) : null,
      per_user_limit: form.per_user_limit ? parseInt(form.per_user_limit) : 1,
      status: form.status,
    };

    if (coupon?.id) payload.id = coupon.id;
    onSave(payload);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'UT';
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setForm(prev => ({ ...prev, code }));
  };

  return (
    <div className="coupon-modal-overlay" onClick={onClose}>
      <div className="coupon-modal" onClick={e => e.stopPropagation()}>
        <div className="coupon-modal-header">
          <h2>{coupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form className="coupon-form" onSubmit={handleSubmit}>
          {/* Code */}
          <div className="form-group">
            <label className="form-label">Coupon Code *</label>
            <div className="code-input-row">
              <input
                type="text"
                name="code"
                className={`form-input ${errors.code ? 'form-input-error' : ''}`}
                value={form.code}
                onChange={handleChange}
                placeholder="e.g., SAVE20"
                style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={generateCode}>
                Auto
              </button>
            </div>
            {errors.code && <span className="form-error">{errors.code}</span>}
          </div>

          {/* Discount Type */}
          <div className="form-group">
            <label className="form-label">Discount Type *</label>
            <div className="radio-group">
              <label className={`radio-card ${form.discount_type === 'percentage' ? 'radio-card-active' : ''}`}>
                <input type="radio" name="discount_type" value="percentage" checked={form.discount_type === 'percentage'} onChange={handleChange} />
                <span className="radio-card-label">% Percentage</span>
              </label>
              <label className={`radio-card ${form.discount_type === 'flat' ? 'radio-card-active' : ''}`}>
                <input type="radio" name="discount_type" value="flat" checked={form.discount_type === 'flat'} onChange={handleChange} />
                <span className="radio-card-label">₹ Flat Amount</span>
              </label>
            </div>
          </div>

          {/* Discount Value + Max Discount */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Discount Value * {form.discount_type === 'percentage' ? '(%)' : '(₹)'}
              </label>
              <input
                type="number"
                name="discount_value"
                className={`form-input ${errors.discount_value ? 'form-input-error' : ''}`}
                value={form.discount_value}
                onChange={handleChange}
                placeholder={form.discount_type === 'percentage' ? 'e.g., 15' : 'e.g., 200'}
                min="0"
                step="0.01"
              />
              {errors.discount_value && <span className="form-error">{errors.discount_value}</span>}
            </div>
            {form.discount_type === 'percentage' && (
              <div className="form-group">
                <label className="form-label">Max Discount (₹)</label>
                <input
                  type="number"
                  name="max_discount"
                  className="form-input"
                  value={form.max_discount}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                  min="0"
                />
              </div>
            )}
          </div>

          {/* Min Order Value */}
          <div className="form-group">
            <label className="form-label">Minimum Order Value (₹)</label>
            <input
              type="number"
              name="min_order_value"
              className="form-input"
              value={form.min_order_value}
              onChange={handleChange}
              placeholder="e.g., 999 (leave empty for no minimum)"
              min="0"
            />
          </div>

          {/* Categories */}
          <div className="form-group">
            <label className="form-label">Applicable Categories</label>
            <p className="form-hint">Leave all unchecked for all products</p>
            <div className="category-chips">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`category-chip ${form.applicable_categories.includes(cat) ? 'category-chip-active' : ''}`}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Expiry */}
          <div className="form-group">
            <label className="form-label">Expiry Date & Time</label>
            <input
              type="datetime-local"
              name="expiry_date"
              className="form-input"
              value={form.expiry_date}
              onChange={handleChange}
            />
          </div>

          {/* Usage Limits */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total Usage Limit</label>
              <input
                type="number"
                name="total_usage_limit"
                className="form-input"
                value={form.total_usage_limit}
                onChange={handleChange}
                placeholder="Unlimited"
                min="1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Per-User Limit</label>
              <input
                type="number"
                name="per_user_limit"
                className="form-input"
                value={form.per_user_limit}
                onChange={handleChange}
                placeholder="1"
                min="1"
              />
            </div>
          </div>

          {/* Status */}
          <div className="form-group">
            <label className="form-label">Status</label>
            <div className="status-toggle">
              <button
                type="button"
                className={`status-btn ${form.status === 'active' ? 'status-btn-active' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, status: 'active' }))}
              >
                Active
              </button>
              <button
                type="button"
                className={`status-btn ${form.status === 'inactive' ? 'status-btn-inactive' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, status: 'inactive' }))}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="coupon-form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {coupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
