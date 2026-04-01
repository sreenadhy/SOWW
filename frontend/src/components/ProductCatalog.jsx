import { useDeferredValue, useState } from 'react';
import '../styles/product-catalog.css';

function ProductCard({ product, quantity, onUpdateCart, formatCurrency }) {
  const isOutOfStock = product.availableStock <= 0;

  return (
    <article className="product-card">
      <div className="product-card-top">
        <span className="product-unit">{product.unit}</span>
        <span className={`inventory-pill ${isOutOfStock ? 'low' : ''}`}>
          {isOutOfStock ? 'Out of stock' : `${product.availableStock} in stock`}
        </span>
      </div>

      <div className="product-copy">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
      </div>

      <div className="product-card-bottom">
        <div>
          <span className="price-label">Price</span>
          <strong>{formatCurrency(product.price)}</strong>
        </div>

        <div className="qty-controls">
          <button
            type="button"
            onClick={() => onUpdateCart(product.id, quantity - 1)}
            disabled={quantity <= 0}
            aria-label={`Decrease quantity for ${product.name}`}
          >
            -
          </button>
          <span>{quantity || 0}</span>
          <button
            type="button"
            onClick={() =>
              onUpdateCart(product.id, Math.min(quantity + 1, product.availableStock))
            }
            disabled={isOutOfStock || quantity >= product.availableStock}
            aria-label={`Increase quantity for ${product.name}`}
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ProductCatalog({
  products,
  isLoading,
  error,
  onRetry,
  cart,
  onUpdateCart,
  formatCurrency,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);

  const filteredProducts = products.filter((product) => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return (
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  });

  return (
    <section className="catalog-shell" id="catalog">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Catalog</p>
          <h2>Current product lineup</h2>
        </div>
        <label className="catalog-search">
          <span>Search products</span>
          <input
            type="search"
            placeholder="Try coconut or sesame"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
      </div>

      {isLoading ? (
        <div className="state-card">Loading products from the backend...</div>
      ) : null}

      {!isLoading && error ? (
        <div className="state-card error">
          <p>{error}</p>
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !error && filteredProducts.length === 0 ? (
        <div className="state-card">
          <p>No products match your current search.</p>
        </div>
      ) : null}

      {!isLoading && !error && filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map((product) => (
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
