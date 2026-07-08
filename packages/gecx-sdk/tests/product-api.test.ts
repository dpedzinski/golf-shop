import { describe, expect, it, vi } from 'vitest';
import { ProductApiClient, buildProductApiUrl } from '../src';

describe('ProductApiClient', () => {
  it('builds product API URLs with encoded query parameters', () => {
    const url = buildProductApiUrl('https://api.example.test/root', '/products', {
      q: 'carbon driver',
      limit: 5,
      max_price: 500,
      brand: undefined,
    });

    expect(url).toBe('https://api.example.test/root/products?q=carbon+driver&limit=5&max_price=500');
  });

  it('builds product listing URLs with ecommerce filters', () => {
    const url = buildProductApiUrl('https://api.example.test', '/products', {
      category_slug: 'iron-sets',
      min_price: 250,
      max_price: 900,
      in_stock: true,
      sort: 'price_desc',
      page: 2,
      page_size: 12,
    });

    expect(url).toBe(
      'https://api.example.test/products?category_slug=iron-sets&min_price=250&max_price=900&in_stock=true&sort=price_desc&page=2&page_size=12'
    );
  });

  it('calls compare with the expected body', async () => {
    const fetchMock = vi.fn(async () => Response.json({ products: [], missing_product_ids: [] }));
    const client = new ProductApiClient({
      baseUrl: 'https://api.example.test',
      fetch: fetchMock as typeof fetch,
    });

    await client.compareProducts(['P001', 'P002']);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/compare',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ product_ids: ['P001', 'P002'] }),
      })
    );
  });

  it('calls facets, categories, promotions, and cart estimate endpoints', async () => {
    const fetchMock = vi.fn(async () => Response.json({ categories: [], facets: [], count: 0, lines: [] }));
    const client = new ProductApiClient({
      baseUrl: 'https://api.example.test',
      fetch: fetchMock as typeof fetch,
    });

    await client.getFacets();
    await client.getCategories();
    await client.getPromotions({ category: 'CAT_DRIVERS', product_id: 'P001' });
    await client.estimateCart({ items: [{ product_id: 'P001', variant_id: 'V001', quantity: 2 }] });

    expect(fetchMock).toHaveBeenNthCalledWith(1, 'https://api.example.test/facets', expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://api.example.test/categories', expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'https://api.example.test/promotions?category=CAT_DRIVERS&product_id=P001',
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      'https://api.example.test/cart/estimate',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ items: [{ product_id: 'P001', variant_id: 'V001', quantity: 2 }] }),
      })
    );
  });
});
