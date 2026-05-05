import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Edit2, Trash2, Tag, ToggleLeft, ToggleRight, Percent, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import CouponForm from './CouponForm';
import './AdminCoupons.css';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (data) setCoupons(data);
    setLoading(false);
  };

  const handleSave = async (payload) => {
    let error;
    if (payload.id) {
      const { id, ...updates } = payload;
      const res = await supabase.from('coupons').update(updates).eq('id', id);
      error = res.error;
    } else {
      const res = await supabase.from('coupons').insert(payload);
      error = res.error;
    }

    if (error) {
      console.error('Error saving coupon:', error);
      alert('Failed to save coupon: ' + error.message);
      return;
    }

    setShowForm(false);
    setEditCoupon(null);
    fetchCoupons();
  };

  const handleDelete = async (id) => {
    await supabase.from('coupons').delete().eq('id', id);
    setDeleteId(null);
    fetchCoupons();
  };

  const toggleStatus = async (coupon) => {
    const newStatus = coupon.status === 'active' ? 'inactive' : 'active';
    await supabase.from('coupons').update({ status: newStatus }).eq('id', coupon.id);
    fetchCoupons();
  };

  const filtered = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase());
    const isExpired = c.expiry_date && new Date(c.expiry_date) < new Date();
    if (statusFilter === 'active') return matchesSearch && c.status === 'active' && !isExpired;
    if (statusFilter === 'inactive') return matchesSearch && c.status === 'inactive';
    if (statusFilter === 'expired') return matchesSearch && isExpired;
    return matchesSearch;
  });

  const getStatus = (c) => {
    if (c.expiry_date && new Date(c.expiry_date) < new Date()) return { label: 'Expired', cls: 'status-expired' };
    if (c.status === 'active') return { label: 'Active', cls: 'status-active' };
    return { label: 'Inactive', cls: 'status-inactive' };
  };

  const activeCount = coupons.filter(c => c.status === 'active' && (!c.expiry_date || new Date(c.expiry_date) > new Date())).length;
  const totalUses = coupons.reduce((s, c) => s + (c.used_count || 0), 0);

  return (
    <div className="admin-page page-enter">
      <div className="container">
        <button className="back-link" onClick={() => window.history.back()}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="admin-header">
          <div>
            <h1 className="admin-title">Coupon Management</h1>
            <p className="admin-subtitle">Create and manage discount coupons</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditCoupon(null); setShowForm(true); }}>
            <Plus size={18} /> Create Coupon
          </button>
        </div>

        <div className="coupon-stats">
          <div className="coupon-stat-card">
            <span className="coupon-stat-value">{coupons.length}</span>
            <span className="coupon-stat-label">Total</span>
          </div>
          <div className="coupon-stat-card">
            <span className="coupon-stat-value" style={{ color: 'var(--success)' }}>{activeCount}</span>
            <span className="coupon-stat-label">Active</span>
          </div>
          <div className="coupon-stat-card">
            <span className="coupon-stat-value" style={{ color: 'var(--warning)' }}>{totalUses}</span>
            <span className="coupon-stat-label">Total Uses</span>
          </div>
        </div>

        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={16} className="admin-search-icon" />
            <input type="text" className="form-input admin-search-input" placeholder="Search coupons..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="coupon-filters">
            {['all', 'active', 'inactive', 'expired'].map(s => (
              <button key={s} className={`filter-chip ${statusFilter === s ? 'filter-chip-active' : ''}`} onClick={() => setStatusFilter(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner"></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Tag size={48} />
            <h3>No coupons found</h3>
            <p>Create your first coupon to get started.</p>
            <button className="btn btn-primary" onClick={() => { setEditCoupon(null); setShowForm(true); }}><Plus size={16} /> Create Coupon</button>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Usage</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(coupon => {
                  const st = getStatus(coupon);
                  return (
                    <tr key={coupon.id}>
                      <td>
                        <div className="coupon-code-cell">
                          <div className="coupon-code-icon-cell">
                            {coupon.discount_type === 'percentage' ? <Percent size={14} /> : <span>₹</span>}
                          </div>
                          <div>
                            <span className="coupon-code-text">{coupon.code}</span>
                            {coupon.applicable_categories?.length > 0 && (
                              <span className="coupon-categories-text">{coupon.applicable_categories.join(', ')}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="coupon-discount-value">
                          {coupon.discount_type === 'flat' ? `₹${coupon.discount_value}` : `${coupon.discount_value}%`}
                        </span>
                        {coupon.discount_type === 'percentage' && coupon.max_discount && (
                          <span className="coupon-max-cap"> max ₹{coupon.max_discount}</span>
                        )}
                      </td>
                      <td>{coupon.min_order_value > 0 ? `₹${coupon.min_order_value.toLocaleString('en-IN')}` : <span className="text-muted">—</span>}</td>
                      <td>{coupon.used_count || 0}{coupon.total_usage_limit ? ` / ${coupon.total_usage_limit}` : ''}</td>
                      <td>
                        {coupon.expiry_date ? (
                          <span className="coupon-expiry-cell"><Clock size={12} /> {new Date(coupon.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        ) : <span className="text-muted">No expiry</span>}
                      </td>
                      <td><span className={`coupon-status-badge ${st.cls}`}>{st.label}</span></td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleStatus(coupon)} title="Toggle">
                            {coupon.status === 'active' ? <ToggleRight size={18} color="var(--success)" /> : <ToggleLeft size={18} />}
                          </button>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setEditCoupon(coupon); setShowForm(true); }} title="Edit">
                            <Edit2 size={16} />
                          </button>
                          {deleteId === coupon.id ? (
                            <button className="btn btn-ghost btn-sm btn-icon delete-confirm" onClick={() => handleDelete(coupon.id)}>
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setDeleteId(coupon.id)} title="Delete">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <CouponForm coupon={editCoupon} onSave={handleSave} onClose={() => { setShowForm(false); setEditCoupon(null); }} />
      )}
    </div>
  );
}
