import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, DollarSign, ShoppingCart, Plus, TrendingUp, Truck, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, lowStock: 0, totalValue: 0, categories: 0, orders: 0, activeCoupons: 0 });
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: products } = await supabase.from('products').select('*');
    const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: couponCount } = await supabase.from('coupons').select('*', { count: 'exact', head: true }).eq('status', 'active');
    if (products) {
      const categories = new Set(products.map(p => p.category));
      setStats({
        total: products.length,
        lowStock: products.filter(p => p.stock <= 5).length,
        totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
        categories: categories.size,
        orders: orderCount || 0,
        activeCoupons: couponCount || 0,
      });
      setRecentProducts(products.slice(0, 5));
    }
  };

  const statCards = [
    { icon: Package, label: 'Total Products', value: stats.total, color: 'var(--accent)' },
    { icon: Truck, label: 'Total Orders', value: stats.orders, color: 'var(--mood-confident)' },
    { icon: Tag, label: 'Active Coupons', value: stats.activeCoupons, color: 'var(--mood-relaxed)' },
    { icon: AlertTriangle, label: 'Low Stock', value: stats.lowStock, color: 'var(--warning)' },
    { icon: DollarSign, label: 'Inventory Value', value: `₹${stats.totalValue.toLocaleString('en-IN')}`, color: 'var(--success)' },
  ];

  return (
    <div className="admin-page page-enter">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Manage your store products, inventory & orders</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/admin/coupons" className="btn btn-secondary">
              <Tag size={18} /> Manage Coupons
            </Link>
            <Link to="/admin/orders" className="btn btn-secondary">
              <Truck size={18} /> Manage Orders
            </Link>
            <Link to="/admin/products/new" className="btn btn-primary">
              <Plus size={18} /> Add Product
            </Link>
          </div>
        </div>

        <div className="stats-grid">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="stat-card" style={{ '--stat-color': stat.color }}>
                <div className="stat-icon">
                  <Icon size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Recent Products</h2>
            <Link to="/admin/products" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Mood</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="table-product">
                        <img src={product.image_url} alt={product.name} className="table-product-img" />
                        <div>
                          <span className="table-product-name">{product.name}</span>
                          <span className="table-product-id">{product.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td><span className={`badge badge-${product.mood_tag?.toLowerCase()}`}>{product.mood_tag}</span></td>
                    <td>₹{product.price?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`stock-badge ${product.stock <= 5 ? 'stock-low' : 'stock-ok'}`}>
                        {product.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
