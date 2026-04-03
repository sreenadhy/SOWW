import ProductCard from './ProductCard';
import '../styles/product-catalog.css';

export default function ProductCatalog({
  products,
  isLoading,
  error,
  onRetry,
  cart,
  onUpdateCart,
  formatCurrency,
  sectionId,
}) {
  return (
    <section className="catalog-shell" id={sectionId}>
      {isLoading ? <div className="state-card">Loading products...</div> : null}

      {!isLoading && error ? (
        <div className="state-card error">
          <p>{error}</p>
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !error && products.length === 0 ? (
        <div className="state-card">No products match your search.</div>
      ) : null}

      {!isLoading && !error && products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={cart[product.id] || 0}
              onUpdateCart={onUpdateCart}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
