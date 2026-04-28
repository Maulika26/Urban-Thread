import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Admin.css';

const categories = ['T-Shirts', 'Hoodies', 'Jeans', 'Jackets', 'Pants', 'Shirts', 'Sets', 'Blazers'];
const moods = ['Confident', 'Relaxed', 'Energetic'];

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    id: '',
    name: '',
    category: categories[0],
    mood_tag: moods[0],
    price: '',
    stock: '',
    description: '',
    image_url: '',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    if (data) setForm(data);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'sizes') {
      const updatedSizes = checked 
        ? [...form.sizes, value]
        : form.sizes.filter(s => s !== value);
      setForm(prev => ({ ...prev, sizes: updatedSizes }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const productData = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
    };

    try {
      if (isEditing) {
        const { error: err } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from('products')
          .insert(productData);
        if (err) throw err;
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="admin-page page-enter">
      <div className="container">
        <button className="back-link" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        <div className="admin-header">
          <h1 className="admin-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
        </div>

        <div className="product-form-layout">
          <form className="product-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            {!isEditing && (
              <div className="form-group">
                <label className="form-label">Product ID *</label>
                <input type="text" name="id" className="form-input" value={form.id} onChange={handleChange} placeholder="e.g. UT011" required />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input type="text" name="name" className="form-input" value={form.name} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="category" className="form-input" value={form.category} onChange={handleChange}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Mood Tag *</label>
                <select name="mood_tag" className="form-input" value={form.mood_tag} onChange={handleChange}>
                  {moods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input type="number" name="price" className="form-input" value={form.price} onChange={handleChange} min="0" step="1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Stock *</label>
                <input type="number" name="stock" className="form-input" value={form.stock} onChange={handleChange} min="0" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-input" rows="4" value={form.description} onChange={handleChange}></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input type="url" name="image_url" className="form-input" value={form.image_url} onChange={handleChange} placeholder="https://..." />
            </div>

            <div className="form-group">
              <label className="form-label">Available Sizes</label>
              <div className="sizes-grid" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <label key={size} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="sizes"
                      value={size}
                      checked={form.sizes.includes(size)}
                      onChange={handleChange}
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              <Save size={18} />
              {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Add Product')}
            </button>
          </form>

          <div className="product-preview">
            <h3>Preview</h3>
            <div className="preview-card">
              {form.image_url ? (
                <img src={form.image_url} alt="Preview" className="preview-image" />
              ) : (
                <div className="preview-placeholder">
                  <Image size={48} />
                  <p>Image preview</p>
                </div>
              )}
              <div className="preview-info">
                <span className="product-card-category">{form.category || 'Category'}</span>
                <h4>{form.name || 'Product Name'}</h4>
                <span className="product-card-price">{form.price ? `₹${parseInt(form.price).toLocaleString('en-IN')}` : '₹0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
