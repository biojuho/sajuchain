import React from 'react';

export interface ProductCardProps {
  title?: string;
  description?: string;
  price?: string;
  onBuy?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ title, description, price, onBuy }) => {
  if (!title && !description && !price) {
    return <div data-testid="fallback">No product information available.</div>;
  }

  return (
    <div className="p-4 border rounded-lg shadow-md" data-testid="product-card">
      {title && <h2 className="text-xl font-bold" data-testid="title">{title}</h2>}
      {description && <p className="mt-2" data-testid="description">{description}</p>}
      {price && <p className="mt-2 font-semibold" data-testid="price">{price}</p>}
      {onBuy && (
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={onBuy}
          data-testid="buy-button"
        >
          Buy
        </button>
      )}
    </div>
  );
};

export default ProductCard;
