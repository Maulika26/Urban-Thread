import './SkeletonLoader.css';

export function ProductCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-image"></div>
      <div className="skeleton-body">
        <div className="skeleton skeleton-text-sm" style={{ width: '40%' }}></div>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-text" style={{ width: '30%' }}></div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="product-grid-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="detail-skeleton">
      <div className="skeleton skeleton-detail-image"></div>
      <div className="detail-skeleton-info">
        <div className="skeleton skeleton-text-sm" style={{ width: '25%' }}></div>
        <div className="skeleton skeleton-title" style={{ width: '80%', height: '28px' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '20%', height: '24px' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '100%', marginTop: '24px' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
        <div className="skeleton" style={{ width: '180px', height: '48px', marginTop: '24px' }}></div>
      </div>
    </div>
  );
}
