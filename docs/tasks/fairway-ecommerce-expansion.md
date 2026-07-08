# Fairway E-Commerce Expansion

## Summary

Turn the canonical `apps/static-site` Fairway Supply storefront into a fuller e-commerce demo backed by the BigQuery product API. The legacy `frontend/index.html` and older Vite pages remain reference material only; new work should target `apps/static-site`.

## Current Findings

- [x] Canonical storefront is `apps/static-site/`.
- [x] Current canonical site now includes route-backed e-commerce pages, while preserving the existing assistant/widget homepage experience.
- [x] Legacy `frontend/index.html` is non-canonical unless that frontend is revived later. It is FairwayIQ-branded, loads Tailwind from CDN, loads CES chat scripts, and has duplicate module script references.
- [x] Product API reads BigQuery views for catalog, compare, categories, inventory, financing, loyalty, promotions, shipping, returns, warranties, and checkout guidance.
- [x] BigQuery seed has rich e-commerce data and now includes storefront-oriented read views.
- [x] Active financing and promotion views now use `CURRENT_DATE()` instead of the hard-coded active date. Remaining `DATE '2026-07-08'` values are seed snapshot data, not active-date filters.

## UI Tasks

### Routes In `apps/static-site/app`

- [x] Add `/shop` product listing page.
  - [x] Supports search, category, brand, player profile, stock, price, sort, page, and page size query params.
  - [x] Renders API-backed products when `NEXT_PUBLIC_PRODUCT_API_URL` is set.
  - [x] Falls back to local demo products with a visible API status message.
- [x] Add `/category/[slug]` category landing/listing page.
  - [x] Locks category by slug while preserving other listing filters.
  - [x] Uses category navigation data from the product API where available.
- [x] Add `/products/[productId]` product detail page.
  - [x] Shows gallery-style hero image, brand, category, description, rating, specs, reviews, inventory, variants, promotions/purchase support, shipping, returns, warranties, and financing/loyalty context.
  - [x] Includes add-to-cart and assistant prompt link: `Ask if this fits my game`.
- [x] Add `/cart`.
  - [x] Uses localStorage cart state.
  - [x] Uses storage key `fairway-cart-v1`.
  - [x] Cart line shape is `{ productId, variantId, quantity }`.
  - [x] Supports quantity updates, removal, estimated subtotal/rewards, and checkout CTA.
- [x] Add `/checkout`.
  - [x] Implements realistic non-payment demo checkout guidance.
  - [x] Surfaces shipping, financing, loyalty, returns, warranties, and policy data.
  - [x] Does not capture real payment and does not persist orders.
- [x] Add `/compare`.
  - [x] Reads selected product IDs from `ids=P001,P007`.
  - [x] Falls back to demo product comparison when the product API is not configured.

### Reusable Storefront Pieces

- [x] Header/nav with shop, compare, checkout, and cart count.
- [x] Search and filter form.
- [x] Category rail/listing navigation.
- [x] Product card.
- [x] Filter sidebar.
- [x] Variant selector.
- [x] Cart provider.
- [x] Order summary.
- [x] Policy and purchase-support panels.
- [x] API status/error fallback states.
- [x] Shared storefront config loader.

### UI Definition Of Done

- [x] Pages are directly navigable with real routes.
- [x] Listing filters use URL query params.
- [x] Cart state survives page navigation through `fairway-cart-v1`.
- [x] Pages render API data when configured and graceful fallback data when unavailable.
- [x] GECX/CES assistant integration remains present on the homepage.
- [x] Product-page prompt supports the e-commerce use case.

## API Tasks

### Product Search

- [x] Extend `GET /products` with:
  - [x] `category_id`
  - [x] `category_slug`
  - [x] `min_price`
  - [x] `max_price`
  - [x] `in_stock`
  - [x] `sort`
  - [x] `page`
  - [x] `page_size`
- [x] Preserve existing `products` and `count` response fields for compatibility.
- [x] Add pagination metadata while keeping old consumers working.

### Product Detail

- [x] Make `GET /products/{product_id}` return PDP-ready data.
- [x] Preserve `product_id` and `variants`.
- [x] Include product, variant, spec, image, review, inventory, promotion, financing, loyalty, shipping, return, and warranty context where BigQuery views expose it.

### New Endpoints

- [x] Add `GET /facets`.
  - [x] Category facets.
  - [x] Brand facets.
  - [x] Player profile facets.
  - [x] Stock facets.
  - [x] Price range facet.
- [x] Add `POST /cart/estimate`.
  - [x] Validates line items against current BigQuery pricing/inventory.
  - [x] Returns available line totals.
  - [x] Returns unavailable item reasons.
  - [x] Returns subtotal.
  - [x] Returns rewards estimate.
  - [x] Returns financing and shipping hints.
- [x] Update `/openapi.json` summaries and schemas for changed and new routes.

### API Definition Of Done

- [x] Existing `/products`, `/products/{id}`, `/compare`, and purchase-support endpoints remain backward-compatible.
- [x] New product listing filters map to BigQuery-backed data.
- [x] Cart estimate is read-only and does not create durable order state.
- [x] Local Python compile passes for API and MCP server modules.

## SDK And MCP Tasks

### SDK

- [x] Expand `packages/gecx-sdk/src/product-api.ts`.
- [x] Add `CategoryNavigationItem`.
- [x] Add `ProductFacetResponse`.
- [x] Add `ProductDetailResponse`.
- [x] Add `CartEstimateRequest`.
- [x] Add `CartEstimateResponse`.
- [x] Expand `ProductSearchParams`.
- [x] Add typed clients for:
  - [x] Categories.
  - [x] Facets.
  - [x] Promotions.
  - [x] PDP data.
  - [x] Cart estimate.
- [x] Unit test URL building and SDK methods for new product search params and cart estimate.

### MCP

- [x] Update `services/mcp-server/main.py` `search_products` tool schema with new search/filter params.
- [x] Add `estimate_cart` tool.
- [x] Map `estimate_cart` to `/cart/estimate`.
- [x] Preserve existing product and purchase-support tools.

### SDK/MCP Definition Of Done

- [x] SDK consumers can call the expanded search, facets, PDP, category, promotion, and cart-estimate APIs.
- [x] MCP tools expose the new product search and cart estimate surfaces.
- [x] SDK tests cover the new params and cart estimate method.

## BigQuery / Database Tasks

### Storefront Views

- [x] Keep BigQuery as the read-optimized product source for this pass.
- [x] Do not use BigQuery for transactional order writes.
- [x] Add `vw_product_listing_current`.
  - [x] One row per product for PLP cards.
  - [x] Includes category slug/name, brand, player profile, pricing, stock, rating, image, tags, and variants.
- [x] Add `vw_product_detail_current`.
  - [x] PDP-oriented product, specs, review, image, inventory, price, and variant data.
- [x] Add `vw_product_facets`.
  - [x] Filter counts and price ranges for listing pages.
- [x] Add `vw_category_navigation`.
  - [x] Category IDs, slugs, names, parent categories, counts, and price ranges.
- [x] Add `vw_cart_pricing_current`.
  - [x] Current purchasable variant pricing/inventory for cart estimates.
- [x] Replace hard-coded active-date filters in financing and promotion views with `CURRENT_DATE()`.
- [x] Update docs and smoke-test query guidance.

### BigQuery Smoke Queries

Run these against the target project/dataset after applying the seed SQL:

```sql
SELECT COUNT(*) AS row_count FROM `affable-seat-501018-q0.golf_products.vw_product_listing_current`;
SELECT COUNT(*) AS row_count FROM `affable-seat-501018-q0.golf_products.vw_product_detail_current`;
SELECT COUNT(*) AS row_count FROM `affable-seat-501018-q0.golf_products.vw_product_facets`;
SELECT COUNT(*) AS row_count FROM `affable-seat-501018-q0.golf_products.vw_category_navigation`;
SELECT COUNT(*) AS row_count FROM `affable-seat-501018-q0.golf_products.vw_cart_pricing_current`;
SELECT COUNT(*) AS active_financing_rows FROM `affable-seat-501018-q0.golf_products.vw_active_financing_options`;
SELECT COUNT(*) AS active_promotion_rows FROM `affable-seat-501018-q0.golf_products.vw_active_promotions`;
```

Expected result: each storefront view returns nonzero rows. Active financing and promotion rows should be evaluated relative to the execution date through `CURRENT_DATE()`.

### Database Definition Of Done

- [x] Storefront API has read views for listing, detail, facets, category navigation, and cart pricing.
- [x] Active promotion/financing logic is date-relative.
- [ ] Apply seed SQL to the target BigQuery dataset and record row counts from the smoke queries above.

## Tests And Validation

### Automated Checks

- [x] `npm run site:prepare`
  - Result: passed.
- [x] `python3 -m py_compile services/product-api/main.py services/mcp-server/main.py`
  - Result: passed.
- [x] `npm run typecheck`
  - Result: passed.
- [x] `npm run test`
  - Result: passed.
- [x] `npm run site:build`
  - Result: passed.
- [x] `CI=1 npm run test:e2e --workspace apps/static-site`
  - Result: passed when run unsandboxed.
  - Note: sandboxed Chromium launch fails on this macOS host with `MachPortRendezvousServer: Permission denied`; the unsandboxed Playwright run passed 4 tests. `CI=1` is used locally so Playwright starts the configured GECX demo server instead of reusing an already-running dev server.

### Coverage Added Or Expanded

- [x] SDK unit tests for expanded product search URL params.
- [x] SDK unit tests for cart estimate.
- [x] Static-site e2e tests for homepage assistant/widgets.
- [x] Static-site e2e tests for `/shop` filters and `/category/[slug]`.
- [x] Static-site e2e tests for PDP variant selection and add-to-cart.
- [x] Static-site e2e tests for cart and checkout route.
- [x] Static-site e2e tests for `/compare?ids=...`.

### Remaining Manual Validation

- [ ] Execute BigQuery smoke queries after deploying the updated seed SQL.
- [ ] Smoke `/products`, `/products/{id}`, `/facets`, `/cart/estimate`, `/promotions`, `/financing`, `/shipping`, `/returns`, and `/warranties` against the live API environment with BigQuery credentials.
- [ ] Check API responses with a real `NEXT_PUBLIC_PRODUCT_API_URL` in `apps/static-site`.

## Public Interfaces

- [x] `ProductSearchParams` accepts expanded filters.
- [x] `CategoryNavigationItem` documents category navigation payloads.
- [x] `ProductFacetResponse` documents listing facets.
- [x] `ProductDetailResponse` documents PDP payloads.
- [x] `CartEstimateRequest` documents cart request lines.
- [x] `CartEstimateResponse` documents validated cart totals, unavailable items, rewards estimate, and purchase hints.
- [x] Existing response fields remain compatible for current callers.

## Out Of Scope

- [x] No real payment capture.
- [x] No durable order persistence.
- [x] No transactional writes to BigQuery.
- [x] No revival of legacy `frontend/index.html`.
- [x] No production deployment in this task.
- [x] No authenticated customer account flow.
- [x] No warehouse reservation or inventory decrement logic.

## Final Definition Of Done

- [x] Task file exists with checklists for UI, API/SDK/MCP, BigQuery, tests, and out-of-scope decisions.
- [x] Canonical site has navigable e-commerce pages backed by the product API contract with demo fallbacks.
- [x] Product listing, product detail, cart estimate, checkout guidance, promotions, financing, loyalty, shipping, returns, and warranties render through API-capable code paths with graceful fallback/error states.
- [x] API and SDK types document the new contracts and remain compatible with existing consumers.
- [x] BigQuery views support listing, detail, facets, categories, and cart pricing, with validation queries documented.
- [x] Listed local checks pass.
- [ ] Live BigQuery/API smoke checks are complete in a credentialed environment.
