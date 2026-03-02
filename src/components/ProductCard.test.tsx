import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import ProductCard from './ProductCard';

describe('ProductCard', () => {
  it('renders content when props are provided', () => {
    const html = renderToStaticMarkup(
      <ProductCard title="Test Product" description="A great product" price="$9.99" />
    );

    expect(html).toContain('Test Product');
    expect(html).toContain('A great product');
    expect(html).toContain('$9.99');
  });

  it('wires onBuy handler to the button', () => {
    const onBuy = vi.fn();
    const element = ProductCard({
      title: 'Test Product',
      description: 'A great product',
      price: '$9.99',
      onBuy,
    });

    expect(React.isValidElement(element)).toBe(true);
    if (!React.isValidElement(element)) {
      return;
    }

    const root = element as React.ReactElement<{ children?: React.ReactNode }>;
    const children = React.Children.toArray(root.props.children);
    const buyButton = children.find((child) => {
      if (!React.isValidElement<{ 'data-testid'?: string }>(child)) {
        return false;
      }
      return child.props['data-testid'] === 'buy-button';
    });

    expect(React.isValidElement(buyButton)).toBe(true);
    if (!React.isValidElement<{ onClick?: () => void }>(buyButton)) {
      return;
    }

    buyButton.props.onClick?.();
    expect(onBuy).toHaveBeenCalledTimes(1);
  });

  it('shows fallback UI when no props are provided', () => {
    const html = renderToStaticMarkup(<ProductCard />);
    expect(html).toContain('No product information available.');
  });
});
