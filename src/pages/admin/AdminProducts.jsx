import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Admin.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchProducts();

    // Realtime subscription
    const channel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (deleteId === id) {
      await supabase.from('products').delete().eq('id', id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setDeleteId(null);
    } else {
      setDeleteId(id);
      setTimeout(() => setDeleteId(null), 3000);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page page-enter">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">All Products</h1>
            <p className="admin-subtitle">{products.length} products in store</p>
          </div>
          <Link to="/admin/products/new" className="btn btn-primary">
            <Plus size={18} /> Add Product
          </Link>
        </div>

        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={18} className="admin-search-icon" />
            <input
              type="text"
              className="form-input admin-search-input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner"></div></div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Mood</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
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
                    <td>
                      <div className="table-actions">
                        <Link to={`/admin/products/edit/${product.id}`} className="btn btn-ghost btn-sm">
                          <Edit size={16} />
                        </Link>
                        <button
                          className={`btn btn-ghost btn-sm ${deleteId === product.id ? 'delete-confirm' : ''}`}
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 size={16} />
                          {deleteId === product.id && <span>Confirm?</span>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state">
                <p>No products found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
