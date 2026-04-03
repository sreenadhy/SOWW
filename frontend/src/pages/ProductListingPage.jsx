import { useDeferredValue } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCatalog from '../components/ProductCatalog';
import TaglineStrip from '../components/TaglineStrip';
import useStorefront from '../hooks/useStorefront';
import { ROUTES } from '../utils/routes';

export default function ProductListingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    products,
    productsLoading,
    productsError,
    cart,
    cartCount,
    loadProducts,
    updateCart,
    formatCurrency,
  } = useStorefront();
  const deferredSearch = useDeferredValue(searchParams.get('q') || '');
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
    <section className="plp-page">
      <ProductCatalog
        sectionId="catalog"
        products={filteredProducts}
        isLoading={productsLoading}
        error={productsError}
        onRetry={loadProducts}
        cart={cart}
        onUpdateCart={updateCart}
        formatCurrency={formatCurrency}
      />

      <div className="plp-actions">
        <p>
          {cartCount > 0
            ? `${cartCount} item${cartCount > 1 ? 's' : ''} added to cart`
            : 'Add items to continue'}
        </p>
        <button
          type="button"
          className="primary-button"
          onClick={() => navigate(ROUTES.cart)}
          disabled={cartCount === 0}
        >
          Continue to Cart
        </button>
      </div>

      <TaglineStrip />
    </section>
  );
}
