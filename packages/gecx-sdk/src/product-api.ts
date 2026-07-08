export type FetchLike = typeof fetch;

export interface ProductApiClientOptions {
  baseUrl: string;
  fetch?: FetchLike;
}

export interface ProductSearchParams {
  q?: string;
  category?: string;
  category_id?: string;
  category_slug?: string;
  brand?: string;
  skill_level?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
  page?: number;
  page_size?: number;
  limit?: number;
}

export interface ProductSummary {
  product_id?: string;
  id?: string;
  product_name?: string;
  name?: string;
  brand_name?: string;
  category_id?: string;
  category_slug?: string;
  category_name?: string;
  parent_category?: string;
  model_year?: number;
  release_season?: string;
  product_status?: string;
  lifecycle_stage?: string;
  target_player_profile?: string;
  handicap_range?: string;
  min_current_sale_price?: number;
  max_current_sale_price?: number;
  max_msrp?: number;
  msrp?: number;
  current_sale_price?: number;
  total_stock_quantity?: number;
  average_rating?: number;
  review_count?: number;
  short_description?: string;
  long_description?: string;
  description?: string;
  sample_positive_review?: string;
  sample_negative_review?: string;
  inventory_status?: string;
  image_url?: string;
  image_alt?: string;
  image_uris?: string[];
  specs?: Array<Record<string, unknown>>;
  tags?: string[];
  variants?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface SearchProductsResponse {
  products: ProductSummary[];
  count: number;
  total_count?: number;
  page?: number;
  page_size?: number;
}

export interface ProductVariant {
  product_id?: string;
  variant_id?: string;
  sku?: string;
  current_sale_price?: number;
  msrp?: number;
  stock_quantity?: number;
  inventory_status?: string;
  [key: string]: unknown;
}

export interface ProductDetailResponse {
  product_id: string;
  product?: ProductSummary;
  variants: ProductVariant[];
}

export type ProductDetailsResponse = ProductDetailResponse;

export interface CategoryNavigationItem {
  category_id: string;
  category_slug?: string;
  category_name: string;
  parent_category?: string;
  product_count?: number;
  min_current_sale_price?: number;
  max_current_sale_price?: number;
  average_rating?: number;
  image_url?: string;
  image_alt?: string;
  [key: string]: unknown;
}

export interface CategoriesResponse {
  categories: CategoryNavigationItem[];
  count?: number;
}

export interface ProductFacet {
  facet_type: string;
  facet_value: string;
  facet_slug?: string;
  facet_label: string;
  result_count: number;
  min_price?: number;
  max_price?: number;
}

export interface ProductFacetResponse {
  facets: ProductFacet[];
  categories: ProductFacet[];
  brands: ProductFacet[];
  player_profiles: ProductFacet[];
  stock: ProductFacet[];
  price?: ProductFacet;
  count: number;
}

export interface CartEstimateLineInput {
  product_id?: string;
  productId?: string;
  variant_id?: string;
  variantId?: string;
  quantity: number;
}

export interface CartEstimateRequest {
  items: CartEstimateLineInput[];
}

export interface CartEstimateLine {
  product_id: string;
  variant_id: string;
  sku?: string;
  product_name: string;
  brand_name?: string;
  category_id?: string;
  category_slug?: string;
  category_name?: string;
  image_url?: string;
  image_alt?: string;
  quantity: number;
  unit_price: number;
  line_subtotal: number;
  stock_quantity?: number;
  inventory_status?: string;
  is_available: boolean;
  options?: Record<string, unknown>;
}

export interface CartUnavailableItem {
  product_id?: string | null;
  variant_id?: string;
  quantity?: number;
  reason: string;
  stock_quantity?: number;
  index?: number;
}

export interface CartEstimateResponse {
  lines: CartEstimateLine[];
  unavailable_items: CartUnavailableItem[];
  subtotal: number;
  rewards_points_estimate: number;
  financing_hints?: Array<Record<string, unknown>>;
  shipping_hints?: Array<Record<string, unknown>>;
  currency?: string;
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
    return this.get('/products', params as Record<string, string | number | boolean | undefined>);
  }

  getProductDetails(productId: string): Promise<ProductDetailsResponse> {
    return this.get(`/products/${encodeURIComponent(productId)}`);
  }

  compareProducts(productIds: string[]): Promise<CompareProductsResponse> {
    return this.post('/compare', { product_ids: productIds });
  }

  getCategories(): Promise<CategoriesResponse> {
    return this.get('/categories');
  }

  getFacets(): Promise<ProductFacetResponse> {
    return this.get('/facets');
  }

  estimateCart(request: CartEstimateRequest): Promise<CartEstimateResponse> {
    return this.post('/cart/estimate', request);
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

  getPromotions(params: { category?: string; product_id?: string } = {}): Promise<CollectionResponse> {
    return this.get('/promotions', params);
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
