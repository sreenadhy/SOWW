import ProductArtwork from './ProductArtwork';
import QuantityControl from './QuantityControl';
import '../styles/product-card.css';

export default function ProductCard({ product, quantity, onUpdateCart, formatCurrency }) {
  const isOutOfStock = product.availableStock <= 0;

  return (
    <article className="product-card">
      <div className="product-card-media">
        <ProductArtwork name={product.name} emphasis="card" />
      </div>

      <div className="product-card-top">
        <span className="product-unit">{product.unit}</span>
        <span className={`inventory-pill ${isOutOfStock ? 'low' : ''}`}>
          {isOutOfStock ? 'Out of stock' : `${product.availableStock} in stock`}
        </span>
      </div>

      <div className="product-copy">
        <h3>{product.name}</h3>
      </div>

      <div className="product-card-bottom">
        <div>
          <span className="price-label">Price</span>
          <strong>{formatCurrency(product.price)}</strong>
        </div>

        <QuantityControl
          quantity={quantity}
          max={product.availableStock}
          disabled={isOutOfStock}
          onChange={(nextQuantity) =>
            onUpdateCart(product.id, nextQuantity, product.availableStock)
          }
          label={`quantity for ${product.name}`}
        />
      </div>
    </article>
  );
}
