import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoader';
import './Products.css';

const categories = ['All', 'T-Shirts', 'Hoodies', 'Jeans', 'Jackets', 'Pants', 'Shirts', 'Sets', 'Blazers'];
const moods = ['All', 'Confident', 'Relaxed', 'Energetic'];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCategory = searchParams.get('category') || 'All';
  const activeMood = searchParams.get('mood') || 'All';
  const activeSort = searchParams.get('sort') || 'newest';
  const priceMin = searchParams.get('minPrice') || '';
  const priceMax = searchParams.get('maxPrice') || '';

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, activeMood, activeSort, priceMin, priceMax]);

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('products').select('*');

    if (activeCategory !== 'All') {
      query = query.eq('category', activeCategory);
    }
    if (activeMood !== 'All') {
      query = query.eq('mood_tag', activeMood);
    }
    if (priceMin) query = query.gte('price', parseInt(priceMin));
    if (priceMax) query = query.lte('price', parseInt(priceMax));

    switch (activeSort) {
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  };

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'All' || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = activeCategory !== 'All' || activeMood !== 'All' || priceMin || priceMax;

  return (
    <div className="products-page page-enter">
      <div className="products-hero">
        <div className="container">
          <h1 className="products-hero-title">Shop All</h1>
          <p className="products-hero-subtitle">
            Discover our full collection of streetwear designed for every mood
          </p>
        </div>
      </div>

      <div className="container">
        <div className="products-toolbar">
          <div className="toolbar-left">
            <button className="btn btn-secondary btn-sm filters-toggle" onClick={() => setFiltersOpen(!filtersOpen)}>
              <SlidersHorizontal size={16} />
              Filters
              {hasActiveFilters && <span className="filter-count">●</span>}
            </button>
            {hasActiveFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                <X size={14} /> Clear All
              </button>
            )}
            <span className="products-count">{products.length} products</span>
          </div>

          <div className="toolbar-right">
            <div className="sort-wrapper">
              <select
                className="form-input sort-select"
                value={activeSort}
                onChange={(e) => updateFilter('sort', e.target.value)}
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="products-layout">
          <aside className={`filters-sidebar ${filtersOpen ? 'filters-open' : ''}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              <button className="btn-icon filters-close" onClick={() => setFiltersOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="filter-group">
              <h4 className="filter-title">Category</h4>
              <div className="filter-options">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`filter-chip ${activeCategory === cat ? 'filter-chip-active' : ''}`}
                    onClick={() => updateFilter('category', cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4 className="filter-title">Mood</h4>
              <div className="filter-options">
                {moods.map(mood => (
                  <button
                    key={mood}
                    className={`filter-chip ${activeMood === mood ? 'filter-chip-active' : ''}`}
                    onClick={() => updateFilter('mood', mood)}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4 className="filter-title">Price Range</h4>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  className="form-input price-input"
                  value={priceMin}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                />
                <span className="price-separator">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="form-input price-input"
                  value={priceMax}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                />
              </div>
            </div>
          </aside>

          <div className="products-content">
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : products.length > 0 ? (
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <SlidersHorizontal size={48} />
                <h3>No products found</h3>
                <p>Try adjusting your filters to find what you're looking for.</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
