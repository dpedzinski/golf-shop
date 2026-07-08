"use client";

import { useEffect, useState } from "react";
import type React from "react";
import {
  ProductApiClient,
  type CartEstimateResponse,
  type CategoryNavigationItem,
  type CollectionResponse,
  type ProductDetailResponse,
  type ProductSearchParams,
  type ProductSummary,
  type ProductVariant,
} from "@bread-prototype/gecx-sdk";
import type { StorefrontConfig } from "../storefront-config";
import { useCart } from "./cart-provider";

const demoProducts: ProductSummary[] = [
  {
    product_id: "P001",
    product_name: "LaunchMax Carbon Driver",
    brand_name: "Apex Canyon Golf",
    category_id: "CAT_DRIVERS",
    category_slug: "drivers",
    category_name: "Drivers",
    parent_category: "Clubs",
    target_player_profile: "Beginner to intermediate golfers who want easier launch.",
    handicap_range: "12-30",
    short_description: "Forgiving distance with a higher launch window for newer players.",
    long_description: "A premium adjustable driver built for ball speed, launch tuning, and stable misses.",
    min_current_sale_price: 449.99,
    max_msrp: 499.99,
    total_stock_quantity: 18,
    average_rating: 4.7,
    review_count: 128,
    inventory_status: "In stock",
    image_url: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=900&q=80",
    image_alt: "Golf driver near golf balls.",
    specs: [{ spec_name: "Loft", spec_value: "9, 10.5, 12 degrees" }],
    tags: ["High launch", "Forgiving"],
    variants: [
      {
        product_id: "P001",
        variant_id: "P001-RH-105-R",
        sku: "LMCD-RH-105-R",
        handedness: "Right",
        loft: "10.5",
        shaft_flex: "Regular",
        current_sale_price: 449.99,
        msrp: 499.99,
        stock_quantity: 8,
        inventory_status: "In stock",
      },
    ],
  },
  {
    product_id: "P007",
    product_name: "VX Forged Cavity Iron Set",
    brand_name: "NorthLake Forge",
    category_id: "CAT_IRONS",
    category_slug: "iron-sets",
    category_name: "Iron Sets",
    parent_category: "Clubs",
    target_player_profile: "Skilled ball strikers who want compact control.",
    handicap_range: "0-12",
    short_description: "Forged cavity-style irons for clean shaping, turf interaction, and soft feel.",
    long_description: "A forged cavity-style iron set with predictable gapping and practical forgiveness.",
    min_current_sale_price: 849.99,
    max_msrp: 999.99,
    total_stock_quantity: 7,
    average_rating: 4.2,
    review_count: 38,
    inventory_status: "Limited stock",
    image_url: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=900&q=80",
    image_alt: "Golf irons on grass.",
    tags: ["Soft feel", "Better player fit"],
    variants: [
      {
        product_id: "P007",
        variant_id: "P007-RH-STIFF",
        sku: "VXFC-RH-STIFF",
        handedness: "Right",
        shaft_flex: "Stiff",
        current_sale_price: 849.99,
        stock_quantity: 4,
        inventory_status: "Limited stock",
      },
    ],
  },
  {
    product_id: "P014",
    product_name: "TourCore Urethane Golf Balls",
    brand_name: "Vantage Core Golf",
    category_id: "CAT_BALLS",
    category_slug: "golf-balls",
    category_name: "Golf Balls",
    parent_category: "Accessories",
    target_player_profile: "Golfers who want spin control and soft feel.",
    handicap_range: "All",
    short_description: "Direct-to-player urethane golf ball for budget-conscious golfers.",
    long_description: "A value-focused urethane ball with short-game spin and strong driver distance.",
    min_current_sale_price: 49.99,
    total_stock_quantity: 45,
    average_rating: 4.0,
    review_count: 395,
    inventory_status: "In stock",
    image_url: "https://images.unsplash.com/photo-1551064711-37179f4d1c93?auto=format&fit=crop&w=900&q=80",
    image_alt: "White golf balls on grass.",
    tags: ["Soft feel", "Best value"],
    variants: [
      {
        product_id: "P014",
        variant_id: "P014-WHITE-12",
        sku: "TCUR-WHITE-12",
        ball_color: "White",
        pack_size: 12,
        current_sale_price: 49.99,
        stock_quantity: 45,
        inventory_status: "In stock",
      },
    ],
  },
];

const demoCategories: CategoryNavigationItem[] = [
  { category_id: "CAT_DRIVERS", category_slug: "drivers", category_name: "Drivers", parent_category: "Clubs", product_count: 1 },
  { category_id: "CAT_IRONS", category_slug: "iron-sets", category_name: "Iron Sets", parent_category: "Clubs", product_count: 1 },
  { category_id: "CAT_BALLS", category_slug: "golf-balls", category_name: "Golf Balls", parent_category: "Accessories", product_count: 1 },
];

export function StorefrontHeader() {
  const { itemCount } = useCart();
  return (
    <header className="store-header">
      <a className="brand" href="/">
        <span className="brand-mark">FS</span>
        <span>Fairway Supply</span>
      </a>
      <nav className="store-nav" aria-label="Storefront">
        <a href="/shop">Shop</a>
        <a href="/compare">Compare</a>
        <a href="/checkout">Checkout</a>
        <a className="cart-link" href="/cart">Cart <span>{itemCount}</span></a>
      </nav>
    </header>
  );
}

export function ProductListingPage({ config, lockedCategorySlug }: { config: StorefrontConfig; lockedCategorySlug?: string }) {
  const [products, setProducts] = useState<ProductSummary[]>(demoProducts);
  const [categories, setCategories] = useState<CategoryNavigationItem[]>(demoCategories);
  const [status, setStatus] = useState("Using local demo products");
  const [initialParams, setInitialParams] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, totalCount: demoProducts.length });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const params = paramsFromUrl(urlParams, lockedCategorySlug);
    setInitialParams(Object.fromEntries(urlParams.entries()));

    if (!config.productApiUrl) {
      const filtered = filterDemoProducts(params);
      setProducts(filtered);
      setPagination({ page: params.page ?? 1, pageSize: params.page_size ?? 12, totalCount: filtered.length });
      return;
    }

    const client = new ProductApiClient({ baseUrl: config.productApiUrl });
    let active = true;
    setStatus("Loading products from BigQuery-backed API");
    Promise.all([client.searchProducts(params), client.getCategories()])
      .then(([response, categoryResponse]) => {
        if (!active) return;
        setProducts(response.products);
        setCategories(categoryResponse.categories.length ? categoryResponse.categories : demoCategories);
        setPagination({
          page: response.page ?? params.page ?? 1,
          pageSize: response.page_size ?? params.page_size ?? 12,
          totalCount: response.total_count ?? response.count,
        });
        setStatus(`Loaded ${response.count} products from the product API`);
      })
      .catch((error: unknown) => {
        if (!active) return;
        const filtered = filterDemoProducts(params);
        setProducts(filtered);
        setPagination({ page: params.page ?? 1, pageSize: params.page_size ?? 12, totalCount: filtered.length });
        setStatus(`Product API unavailable; showing demo products (${String(error)})`);
      });
    return () => {
      active = false;
    };
  }, [config.productApiUrl, lockedCategorySlug]);

  const currentCategory = lockedCategorySlug
    ? categories.find((category) => category.category_slug === lockedCategorySlug)
    : categories.find((category) => category.category_slug === initialParams.category_slug);
  const pageCount = Math.max(1, Math.ceil(pagination.totalCount / pagination.pageSize));
  const compareIds = products.slice(0, 3).map((product) => productId(product)).join(",");

  return (
    <main className="store-page">
      <StorefrontHeader />
      <section className="store-hero compact">
        <p className="eyebrow">{currentCategory ? currentCategory.parent_category ?? "Category" : "Shop"}</p>
        <h1>{currentCategory ? currentCategory.category_name : "Shop golf gear"}</h1>
        <p>Browse BigQuery-backed products with e-commerce filters, inventory signals, and purchase support.</p>
      </section>
      <section className="store-layout">
        <aside className="filter-panel">
          <form method="get" action={lockedCategorySlug ? `/category/${lockedCategorySlug}` : "/shop"}>
            <label>Search<input name="q" defaultValue={initialParams.q ?? ""} placeholder="driver, wedge, waterproof" /></label>
            {!lockedCategorySlug ? (
              <label>
                Category
                <select name="category_slug" defaultValue={initialParams.category_slug ?? ""}>
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.category_id} value={category.category_slug ?? ""}>{category.category_name}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <label>Brand<input name="brand" defaultValue={initialParams.brand ?? ""} /></label>
            <label>Player profile<input name="skill_level" defaultValue={initialParams.skill_level ?? ""} /></label>
            <div className="two-fields">
              <label>Min<input name="min_price" defaultValue={initialParams.min_price ?? ""} inputMode="decimal" /></label>
              <label>Max<input name="max_price" defaultValue={initialParams.max_price ?? ""} inputMode="decimal" /></label>
            </div>
            <label className="check-row"><input name="in_stock" type="checkbox" value="true" defaultChecked={initialParams.in_stock === "true"} /> In stock only</label>
            <label>
              Sort
              <select name="sort" defaultValue={initialParams.sort ?? "relevance"}>
                <option value="relevance">Relevance</option>
                <option value="popular">Popular</option>
                <option value="rating">Rating</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="newest">Newest</option>
              </select>
            </label>
            <input name="page_size" type="hidden" value="12" />
            <button type="submit">Apply filters</button>
          </form>
        </aside>
        <div className="listing-panel">
          <div className="listing-toolbar">
            <ApiStatus message={status} />
            <a className="secondary-action small" href={`/compare?ids=${encodeURIComponent(compareIds)}`}>Compare visible picks</a>
          </div>
          {products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={productId(product)} product={product} />)}</div> : <EmptyState title="No products found" body="Try broader filters." />}
          <div className="pagination">
            <a aria-disabled={pagination.page <= 1} href={pageHref(pagination.page - 1, lockedCategorySlug, initialParams)}>Previous</a>
            <span>Page {pagination.page} of {pageCount}</span>
            <a aria-disabled={pagination.page >= pageCount} href={pageHref(pagination.page + 1, lockedCategorySlug, initialParams)}>Next</a>
          </div>
        </div>
      </section>
    </main>
  );
}

export function ProductDetailPage({ config, productIdValue }: { config: StorefrontConfig; productIdValue: string }) {
  const { addLine } = useCart();
  const [product, setProduct] = useState<ProductSummary | null>(() => demoProducts.find((item) => productId(item) === productIdValue) ?? null);
  const [variants, setVariants] = useState<ProductVariant[]>(() => (product?.variants as ProductVariant[] | undefined) ?? []);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [status, setStatus] = useState("Using local demo product data");
  const [support, setSupport] = useState<Record<string, Record<string, unknown>[]>>({});
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!config.productApiUrl) {
      setSelectedVariantId(((product?.variants as ProductVariant[] | undefined) ?? [])[0]?.variant_id ?? "");
      return;
    }
    const client = new ProductApiClient({ baseUrl: config.productApiUrl });
    let active = true;
    setStatus("Loading product details from BigQuery-backed API");
    client
      .getProductDetails(productIdValue)
      .then((response: ProductDetailResponse) => {
        if (!active) return;
        const loadedProduct = response.product ?? { product_id: response.product_id, variants: response.variants };
        setProduct(loadedProduct);
        setVariants(response.variants);
        setSelectedVariantId(response.variants[0]?.variant_id ?? "");
        setStatus("Loaded product detail from the product API");
        return loadSupport(client, loadedProduct);
      })
      .then((collections) => {
        if (active && collections) setSupport(collections);
      })
      .catch((error: unknown) => {
        if (!active) return;
        const fallback = demoProducts.find((item) => productId(item) === productIdValue) ?? demoProducts[0];
        setProduct(fallback);
        setVariants((fallback.variants as ProductVariant[]) ?? []);
        setSelectedVariantId(((fallback.variants as ProductVariant[]) ?? [])[0]?.variant_id ?? "");
        setStatus(`Product API unavailable; showing demo product (${String(error)})`);
      });
    return () => {
      active = false;
    };
  }, [config.productApiUrl, productIdValue]);

  if (!product) {
    return <main className="store-page"><StorefrontHeader /><EmptyState title="Product not found" body="Return to the shop to choose another product." /></main>;
  }

  const selectedVariant = variants.find((variant) => variant.variant_id === selectedVariantId) ?? variants[0];

  function handleAddToCart() {
    if (!selectedVariant?.variant_id || !product) return;
    addLine({ productId: productId(product), variantId: selectedVariant.variant_id, quantity: 1 });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <main className="store-page">
      <StorefrontHeader />
      <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href={`/category/${product.category_slug ?? ""}`}>{product.category_name ?? "Category"}</a><span>/</span><span>{productName(product)}</span></nav>
      <section className="pdp-grid">
        <div className="pdp-media">{product.image_url ? <img src={product.image_url} alt={product.image_alt ?? productName(product)} /> : null}</div>
        <div className="pdp-info">
          <ApiStatus message={status} />
          <p className="eyebrow">{[product.brand_name, product.category_name].filter(Boolean).join(" / ")}</p>
          <h1>{productName(product)}</h1>
          <p className="lede small">{product.short_description}</p>
          <div className="price-row"><strong>{formatCurrency(selectedVariant?.current_sale_price ?? product.min_current_sale_price)}</strong>{product.max_msrp ? <span>{formatCurrency(product.max_msrp)}</span> : null}</div>
          <div className="rating-row"><span>{product.average_rating ? `${product.average_rating} / 5` : "No rating yet"}</span><span>{product.review_count ? `${product.review_count} reviews` : "Synthetic demo reviews"}</span><span>{product.inventory_status ?? stockLabel(product.total_stock_quantity)}</span></div>
          <label className="variant-select">Variant<select value={selectedVariantId} onChange={(event) => setSelectedVariantId(event.target.value)}>{variants.map((variant) => <option key={variant.variant_id} value={variant.variant_id}>{variantLabel(variant)}</option>)}</select></label>
          <div className="pdp-actions"><button className="primary-action button-reset" disabled={!selectedVariant?.variant_id} onClick={handleAddToCart} type="button">{added ? "Added to cart" : "Add to cart"}</button><a className="secondary-action" href="/#assistant">Ask if this fits my game</a></div>
        </div>
      </section>
      <section className="detail-grid">
        <DetailPanel title="Product details"><p>{product.long_description ?? product.short_description}</p><DefinitionList rows={[["Best fit", product.target_player_profile], ["Handicap range", product.handicap_range], ["Lifecycle", product.lifecycle_stage]]} /></DetailPanel>
        <DetailPanel title="Specs"><SpecList specs={product.specs} tags={product.tags} /></DetailPanel>
        <DetailPanel title="Customer feedback"><p>{product.sample_positive_review ?? "Review snippets are provided by the BigQuery demo dataset."}</p>{product.sample_negative_review ? <p className="muted">Tradeoff: {product.sample_negative_review}</p> : null}</DetailPanel>
        <SupportPanel title="Promotions" items={support.promotions} />
        <SupportPanel title="Financing" items={support.financing} />
        <SupportPanel title="Loyalty" items={support.loyalty} />
        <SupportPanel title="Shipping" items={support.shipping} />
        <SupportPanel title="Returns" items={support.returns} />
        <SupportPanel title="Warranty" items={support.warranties} />
      </section>
    </main>
  );
}

export function CartPage({ config }: { config: StorefrontConfig }) {
  const { lines, updateQuantity, removeLine, clearCart } = useCart();
  const estimate = useCartEstimate(config, lines);
  return (
    <main className="store-page">
      <StorefrontHeader />
      <section className="store-hero compact"><p className="eyebrow">Cart</p><h1>Review your gear</h1><p>Cart lines stay on this device and use API estimates when configured.</p></section>
      {lines.length ? (
        <section className="cart-layout">
          <div className="cart-lines">
            <ApiStatus message={estimate.status} />
            {estimate.response.lines.map((line) => (
              <article className="cart-line" key={line.variant_id}>
                {line.image_url ? <img src={line.image_url} alt={line.image_alt ?? line.product_name} /> : null}
                <div><p className="eyebrow">{line.brand_name}</p><h2>{line.product_name}</h2><p>{variantOptionsLabel(line.options)}</p></div>
                <label>Qty<input min={1} max={99} type="number" value={line.quantity} onChange={(event) => updateQuantity(line.variant_id, Number(event.target.value))} /></label>
                <strong>{formatCurrency(line.line_subtotal || line.unit_price * line.quantity)}</strong>
                <button className="text-button" onClick={() => removeLine(line.variant_id)} type="button">Remove</button>
              </article>
            ))}
          </div>
          <OrderSummary estimate={estimate.response} onClear={clearCart} />
        </section>
      ) : <EmptyState title="Your cart is empty" body="Add gear from a product page to see cart estimates." actionHref="/shop" actionLabel="Continue shopping" />}
    </main>
  );
}

export function CheckoutPage({ config }: { config: StorefrontConfig }) {
  const { lines } = useCart();
  const estimate = useCartEstimate(config, lines);
  const [support, setSupport] = useState<Record<string, Record<string, unknown>[]>>({});
  const [status, setStatus] = useState("Checkout support uses demo guidance until the API is configured");

  useEffect(() => {
    if (!config.productApiUrl) return;
    const client = new ProductApiClient({ baseUrl: config.productApiUrl });
    let active = true;
    setStatus("Loading checkout guidance from the product API");
    Promise.all([client.getCheckoutGuidance(), client.getShipping(), client.getFinancingOptions(estimate.response.subtotal), client.getLoyalty(), client.getReturns(), client.getWarranties()])
      .then(([checkout, shipping, financing, loyalty, returns, warranties]) => {
        if (!active) return;
        setSupport({
          checkout: collectionItems(checkout, "checkout_steps"),
          shipping: collectionItems(shipping, "policies"),
          financing: collectionItems(financing, "financing_options"),
          loyalty: collectionItems(loyalty, "loyalty_tiers"),
          returns: collectionItems(returns, "policies"),
          warranties: collectionItems(warranties, "policies"),
        });
        setStatus("Loaded checkout guidance from the product API");
      })
      .catch((error: unknown) => {
        if (active) setStatus(`Checkout API data unavailable (${String(error)})`);
      });
    return () => {
      active = false;
    };
  }, [config.productApiUrl, estimate.response.subtotal]);

  return (
    <main className="store-page">
      <StorefrontHeader />
      <section className="checkout-grid">
        <div className="checkout-main">
          <p className="eyebrow">Demo checkout</p><h1>Confirm purchase support before payment</h1><ApiStatus message={status} />
          <div className="demo-form"><label>Email<input placeholder="you@example.com" type="email" /></label><label>Shipping ZIP<input placeholder="10001" inputMode="numeric" /></label><label>Delivery preference<select><option>Standard shipping</option><option>Expedited shipping</option></select></label><button type="button">Continue demo checkout</button></div>
          <SupportPanel title="Checkout guidance" items={support.checkout} />
          <SupportPanel title="Shipping options" items={support.shipping ?? estimate.response.shipping_hints} />
          <SupportPanel title="Financing options" items={support.financing ?? estimate.response.financing_hints} />
          <SupportPanel title="Loyalty benefits" items={support.loyalty} />
          <SupportPanel title="Returns" items={support.returns} />
          <SupportPanel title="Warranty" items={support.warranties} />
        </div>
        <OrderSummary estimate={estimate.response} />
      </section>
    </main>
  );
}

export function ComparePage({ config }: { config: StorefrontConfig }) {
  const [products, setProducts] = useState<ProductSummary[]>(demoProducts.slice(0, 3));
  const [status, setStatus] = useState("Using local demo comparison");

  useEffect(() => {
    const ids = (new URLSearchParams(window.location.search).get("ids") ?? "").split(",").map((value) => value.trim()).filter(Boolean);
    const selectedIds = ids.length ? ids : demoProducts.slice(0, 3).map((product) => productId(product));
    if (!config.productApiUrl) {
      setProducts(demoProducts.filter((product) => selectedIds.includes(productId(product))));
      return;
    }
    const client = new ProductApiClient({ baseUrl: config.productApiUrl });
    let active = true;
    setStatus("Loading comparison from product API");
    client.compareProducts(selectedIds).then((response) => {
      if (!active) return;
      setProducts(response.products);
      setStatus(response.missing_product_ids.length ? `Missing: ${response.missing_product_ids.join(", ")}` : "Loaded comparison");
    }).catch((error: unknown) => {
      if (!active) return;
      setProducts(demoProducts.filter((product) => selectedIds.includes(productId(product))));
      setStatus(`Comparison API unavailable; showing demo comparison (${String(error)})`);
    });
    return () => {
      active = false;
    };
  }, [config.productApiUrl]);

  return (
    <main className="store-page">
      <StorefrontHeader />
      <section className="store-hero compact"><p className="eyebrow">Compare</p><h1>Compare the short list</h1><p>Review fit, price, inventory, ratings, and tradeoffs.</p></section>
      <section className="compare-panel"><ApiStatus message={status} /><div className="compare-grid">{products.map((product) => <ProductCard key={productId(product)} product={product} />)}</div><div className="compare-table-wrap"><table className="compare-table"><tbody>{["brand_name", "category_name", "target_player_profile", "inventory_status", "average_rating", "review_count"].map((key) => <tr key={key}><th>{labelize(key)}</th>{products.map((product) => <td key={`${productId(product)}-${key}`}>{displayValue(product[key])}</td>)}</tr>)}<tr><th>Price</th>{products.map((product) => <td key={`${productId(product)}-price`}>{formatCurrency(product.min_current_sale_price)}</td>)}</tr></tbody></table></div></section>
    </main>
  );
}

function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <article className="store-product-card">
      <a href={`/products/${encodeURIComponent(productId(product))}`} aria-label={`View ${productName(product)}`}>
        <div className="product-image">{product.image_url ? <img src={product.image_url} alt={product.image_alt ?? productName(product)} /> : null}</div>
        <div className="product-card-body"><p className="eyebrow">{[product.brand_name, product.category_name].filter(Boolean).join(" / ")}</p><h2>{productName(product)}</h2><p>{product.short_description}</p><div className="product-card-meta"><strong>{formatCurrency(product.min_current_sale_price ?? product.current_sale_price)}</strong><span>{product.average_rating ? `${product.average_rating} / 5` : "New"}</span><span>{product.inventory_status ?? stockLabel(product.total_stock_quantity)}</span></div></div>
      </a>
    </article>
  );
}

function OrderSummary({ estimate, onClear }: { estimate: CartEstimateResponse; onClear?: () => void }) {
  return <aside className="order-summary"><h2>Order summary</h2><div className="summary-row"><span>Subtotal</span><strong>{formatCurrency(estimate.subtotal)}</strong></div><div className="summary-row"><span>Rewards estimate</span><strong>{estimate.rewards_points_estimate} pts</strong></div><div className="summary-row"><span>Shipping</span><strong>Calculated in checkout</strong></div><a className="primary-action summary-action" href="/checkout">Checkout</a>{onClear ? <button className="text-button" onClick={onClear} type="button">Clear cart</button> : null}<p className="muted">Demo checkout only. No payment is captured and no order is persisted.</p></aside>;
}

function useCartEstimate(config: StorefrontConfig, lines: Array<{ productId: string; variantId: string; quantity: number }>) {
  const [response, setResponse] = useState<CartEstimateResponse>(() => estimateDemoCart(lines));
  const [status, setStatus] = useState("Using local cart estimate");

  useEffect(() => {
    if (!lines.length) {
      setResponse(emptyEstimate());
      return;
    }
    if (!config.productApiUrl) {
      setResponse(estimateDemoCart(lines));
      setStatus("Using local cart estimate");
      return;
    }
    const client = new ProductApiClient({ baseUrl: config.productApiUrl });
    let active = true;
    setStatus("Estimating cart from product API");
    client.estimateCart({ items: lines.map((line) => ({ product_id: line.productId, variant_id: line.variantId, quantity: line.quantity })) }).then((estimate) => {
      if (!active) return;
      setResponse(estimate);
      setStatus("Cart estimate loaded from product API");
    }).catch((error: unknown) => {
      if (!active) return;
      setResponse(estimateDemoCart(lines));
      setStatus(`Cart estimate API unavailable; using demo estimate (${String(error)})`);
    });
    return () => {
      active = false;
    };
  }, [config.productApiUrl, lines]);

  return { response, status };
}

async function loadSupport(client: ProductApiClient, product: ProductSummary) {
  const amount = numberValue(product.min_current_sale_price);
  const [promotions, financing, loyalty, shipping, returns, warranties] = await Promise.all([
    client.getPromotions({ product_id: productId(product), category: product.category_id ?? product.category_name }),
    client.getFinancingOptions(amount),
    client.getLoyalty(),
    client.getShipping(),
    client.getReturns(product.category_id ?? product.category_name),
    client.getWarranties(product.category_id ?? product.category_name),
  ]);
  return {
    promotions: collectionItems(promotions, "promotions"),
    financing: collectionItems(financing, "financing_options"),
    loyalty: collectionItems(loyalty, "loyalty_tiers"),
    shipping: collectionItems(shipping, "policies"),
    returns: collectionItems(returns, "policies"),
    warranties: collectionItems(warranties, "policies"),
  };
}

function ApiStatus({ message }: { message: string }) {
  return <p className="api-status">{message}</p>;
}

function EmptyState({ title, body, actionHref, actionLabel }: { title: string; body: string; actionHref?: string; actionLabel?: string }) {
  return <section className="empty-state"><h2>{title}</h2><p>{body}</p>{actionHref && actionLabel ? <a className="primary-action" href={actionHref}>{actionLabel}</a> : null}</section>;
}

function DetailPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="detail-panel"><h2>{title}</h2>{children}</section>;
}

function SupportPanel({ title, items }: { title: string; items?: Record<string, unknown>[] }) {
  return <DetailPanel title={title}>{items?.length ? <div className="support-list">{items.slice(0, 4).map((item, index) => <article key={`${title}-${index}`}><strong>{supportTitle(item)}</strong><p>{supportDescription(item)}</p></article>)}</div> : <p className="muted">No {title.toLowerCase()} data is available yet.</p>}</DetailPanel>;
}

function DefinitionList({ rows }: { rows: Array<[string, unknown]> }) {
  const visibleRows = rows.filter(([, value]) => value !== undefined && value !== null && value !== "");
  if (!visibleRows.length) return null;
  return <dl className="definition-list">{visibleRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{displayValue(value)}</dd></div>)}</dl>;
}

function SpecList({ specs, tags }: { specs?: Array<Record<string, unknown>>; tags?: string[] }) {
  return <div className="spec-list">{specs?.length ? <DefinitionList rows={specs.map((spec) => [String(spec.spec_name ?? spec.name ?? "Spec"), spec.spec_value ?? spec.value])} /> : null}{tags?.length ? <div className="tag-row">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null}</div>;
}

function paramsFromUrl(urlParams: URLSearchParams, lockedCategorySlug?: string): ProductSearchParams {
  return {
    q: valueOrUndefined(urlParams.get("q")),
    category_slug: lockedCategorySlug ?? valueOrUndefined(urlParams.get("category_slug")),
    brand: valueOrUndefined(urlParams.get("brand")),
    skill_level: valueOrUndefined(urlParams.get("skill_level")),
    min_price: numberValue(urlParams.get("min_price")),
    max_price: numberValue(urlParams.get("max_price")),
    in_stock: urlParams.get("in_stock") === "true" ? true : undefined,
    sort: (valueOrUndefined(urlParams.get("sort")) as ProductSearchParams["sort"]) ?? "relevance",
    page: numberValue(urlParams.get("page")) ?? 1,
    page_size: numberValue(urlParams.get("page_size")) ?? 12,
  };
}

function filterDemoProducts(params: ProductSearchParams): ProductSummary[] {
  return demoProducts.filter((product) => {
    const q = params.q?.toLowerCase();
    const price = numberValue(product.min_current_sale_price) ?? 0;
    return (!q || [product.product_name, product.category_name, product.brand_name, product.short_description, product.target_player_profile].filter(Boolean).some((value) => String(value).toLowerCase().includes(q))) &&
      (!params.category_slug || product.category_slug === params.category_slug) &&
      (!params.brand || product.brand_name?.toLowerCase().includes(params.brand.toLowerCase())) &&
      (!params.skill_level || product.target_player_profile?.toLowerCase().includes(params.skill_level.toLowerCase()) || product.handicap_range?.toLowerCase().includes(params.skill_level.toLowerCase())) &&
      (params.min_price === undefined || price >= params.min_price) &&
      (params.max_price === undefined || price <= params.max_price) &&
      (!params.in_stock || (product.total_stock_quantity ?? 0) > 0);
  });
}

function pageHref(page: number, lockedCategorySlug: string | undefined, currentParams: Record<string, string>): string {
  const params = new URLSearchParams(currentParams);
  params.set("page", String(Math.max(1, page)));
  return `${lockedCategorySlug ? `/category/${lockedCategorySlug}` : "/shop"}?${params.toString()}`;
}

function collectionItems(response: CollectionResponse | undefined, preferredKey: string): Record<string, unknown>[] {
  if (!response) return [];
  const preferred = response[preferredKey];
  if (Array.isArray(preferred)) return preferred as Record<string, unknown>[];
  for (const value of Object.values(response)) if (Array.isArray(value)) return value as Record<string, unknown>[];
  return [];
}

function estimateDemoCart(lines: Array<{ productId: string; variantId: string; quantity: number }>): CartEstimateResponse {
  const estimateLines = lines.flatMap((line) => {
    const product = demoProducts.find((item) => productId(item) === line.productId);
    const variant = ((product?.variants as ProductVariant[] | undefined) ?? []).find((item) => item.variant_id === line.variantId);
    if (!product || !variant?.variant_id) return [];
    const unitPrice = numberValue(variant.current_sale_price ?? product.min_current_sale_price) ?? 0;
    return [{
      product_id: productId(product),
      variant_id: variant.variant_id,
      sku: variant.sku,
      product_name: productName(product),
      brand_name: product.brand_name,
      category_id: product.category_id,
      category_slug: product.category_slug,
      category_name: product.category_name,
      image_url: product.image_url,
      image_alt: product.image_alt,
      quantity: line.quantity,
      unit_price: unitPrice,
      line_subtotal: roundMoney(unitPrice * line.quantity),
      stock_quantity: numberValue(variant.stock_quantity),
      inventory_status: String(variant.inventory_status ?? product.inventory_status ?? ""),
      is_available: true,
      options: variant,
    }];
  });
  const subtotal = roundMoney(estimateLines.reduce((sum, line) => sum + line.line_subtotal, 0));
  return { lines: estimateLines, unavailable_items: [], subtotal, rewards_points_estimate: Math.floor(subtotal), financing_hints: [{ offer_name: "Installment plan", repayment_summary: "Split eligible purchases into fixed monthly payments." }], shipping_hints: [{ policy_name: "Standard shipping", policy_notes: "Delivery estimate and fees are calculated at checkout." }], currency: "USD" };
}

function emptyEstimate(): CartEstimateResponse {
  return { lines: [], unavailable_items: [], subtotal: 0, rewards_points_estimate: 0, financing_hints: [], shipping_hints: [], currency: "USD" };
}

function productId(product: ProductSummary): string {
  return String(product.product_id ?? product.id ?? "");
}

function productName(product: ProductSummary): string {
  return String(product.product_name ?? product.name ?? "Unnamed product");
}

function numberValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function valueOrUndefined(value: string | null): string | undefined {
  return value && value.trim() ? value : undefined;
}

function formatCurrency(value: unknown): string {
  const amount = numberValue(value);
  if (amount === undefined) return "Price pending";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function stockLabel(value: unknown): string {
  const quantity = numberValue(value);
  if (quantity === undefined) return "Inventory pending";
  if (quantity <= 0) return "Out of stock";
  if (quantity < 10) return "Limited stock";
  return "In stock";
}

function variantLabel(variant: ProductVariant): string {
  return [variant.handedness, variant.loft ? `${variant.loft} loft` : undefined, variant.shaft_flex ? `${variant.shaft_flex} flex` : undefined, variant.color, variant.size, variant.ball_color, variant.pack_size ? `${variant.pack_size} pack` : undefined, formatCurrency(variant.current_sale_price), variant.inventory_status].filter(Boolean).join(" / ") || String(variant.sku ?? variant.variant_id ?? "Variant");
}

function variantOptionsLabel(options: Record<string, unknown> | undefined): string {
  if (!options) return "Selected variant";
  return [options.handedness, options.loft ? `${options.loft} loft` : undefined, options.shaft_flex ? `${options.shaft_flex} flex` : undefined, options.color, options.size, options.ball_color, options.pack_size ? `${options.pack_size} pack` : undefined].filter(Boolean).join(" / ");
}

function supportTitle(item: Record<string, unknown>): string {
  return String(item.promotion_name ?? item.offer_name ?? item.program_name ?? item.tier_name ?? item.policy_name ?? item.service_name ?? item.step_name ?? "Support detail");
}

function supportDescription(item: Record<string, unknown>): string {
  return String(item.description ?? item.eligibility_summary ?? item.policy_notes ?? item.repayment_summary ?? item.application_disclosure ?? item.responsible_use_note ?? item.risk_note ?? item.disclaimer ?? "Details come from the BigQuery-backed product support dataset.");
}

function displayValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "Not specified";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : String(roundMoney(value));
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.map(displayValue).join(", ");
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).map(displayValue).join(" / ");
  return String(value);
}

function labelize(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
