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
});
