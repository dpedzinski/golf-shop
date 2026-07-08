export type FetchLike = typeof fetch;

export interface ProductApiClientOptions {
  baseUrl: string;
  fetch?: FetchLike;
}

export interface ProductSearchParams {
  q?: string;
  category?: string;
  brand?: string;
  skill_level?: string;
  max_price?: number;
  limit?: number;
}

export interface ProductSummary {
  product_id?: string;
  id?: string;
  product_name?: string;
  name?: string;
  brand_name?: string;
  category_name?: string;
  parent_category?: string;
  target_player_profile?: string;
  handicap_range?: string;
  min_current_sale_price?: number;
  max_current_sale_price?: number;
  current_sale_price?: number;
  total_stock_quantity?: number;
  average_rating?: number;
  review_count?: number;
  short_description?: string;
  description?: string;
  sample_positive_review?: string;
  sample_negative_review?: string;
  inventory_status?: string;
  variants?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface SearchProductsResponse {
  products: ProductSummary[];
  count: number;
}

export interface ProductDetailsResponse {
  product_id: string;
  variants: ProductSummary[];
}

export interface CompareProductsResponse {
  products: ProductSummary[];
  missing_product_ids: string[];
}

export interface CollectionResponse<T = Record<string, unknown>> {
  count?: number;
  [key: string]: T[] | number | undefined;
}

export function buildProductApiUrl(
  baseUrl: string,
  path: string,
  params: Record<string, string | number | boolean | undefined | null> = {}
): string {
  const url = new URL(path.replace(/^\//, ''), normalizeBaseUrl(baseUrl));
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url.href;
}

export class ProductApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchLike;

  constructor(options: ProductApiClientOptions) {
    if (!options.baseUrl) {
      throw new Error('ProductApiClient requires a baseUrl.');
    }
    this.baseUrl = options.baseUrl;
    this.fetchImpl = options.fetch ?? ((input, init) => fetch(input, init));
  }

  searchProducts(params: ProductSearchParams = {}): Promise<SearchProductsResponse> {
    return this.get('/products', params as Record<string, string | number | undefined>);
  }

  getProductDetails(productId: string): Promise<ProductDetailsResponse> {
    return this.get(`/products/${encodeURIComponent(productId)}`);
  }

  compareProducts(productIds: string[]): Promise<CompareProductsResponse> {
    return this.post('/compare', { product_ids: productIds });
  }

  getFinancingOptions(amount?: number): Promise<CollectionResponse> {
    return this.get('/financing', { amount });
  }

  getCardOffers(amount?: number): Promise<CollectionResponse> {
    return this.get('/card-offers', { amount });
  }

  getInstallmentPlans(amount?: number): Promise<CollectionResponse> {
    return this.get('/installment-plans', { amount });
  }

  getLoyalty(): Promise<CollectionResponse> {
    return this.get('/loyalty');
  }

  getShipping(): Promise<CollectionResponse> {
    return this.get('/shipping');
  }

  getReturns(category?: string): Promise<CollectionResponse> {
    return this.get('/returns', { category });
  }

  getWarranties(category?: string): Promise<CollectionResponse> {
    return this.get('/warranties', { category });
  }

  getCheckoutGuidance(): Promise<CollectionResponse> {
    return this.get('/checkout-guidance');
  }

  private async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const response = await this.fetchImpl(buildProductApiUrl(this.baseUrl, path, params), {
      headers: { Accept: 'application/json' },
    });
    return parseJsonResponse<T>(response);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const response = await this.fetchImpl(buildProductApiUrl(this.baseUrl, path), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return parseJsonResponse<T>(response);
  }
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Product API request failed with ${response.status}: ${message}`);
  }
  return response.json() as Promise<T>;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}
