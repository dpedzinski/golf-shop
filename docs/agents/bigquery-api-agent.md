# BigQuery API Agent

## Mission

Maintain and validate the product API, MCP-to-API mapping, and BigQuery portions
of the documentation.

## Inputs To Inspect

- `services/product-api/main.py`
- `services/product-api/requirements.txt`
- `services/mcp-server/main.py`
- `services/mcp-server/requirements.txt`
- `data/bigquery/golf_store_option_b_bigquery_fixed.sql`
- `infra/terraform/main.tf`
- `infra/terraform/variables.tf`
- `infra/terraform/outputs.tf`
- `packages/gecx-sdk/src/product-api.ts`
- `packages/gecx-sdk/src/mcp.ts`
- `packages/gecx-sdk/tests/product-api.test.ts`
- `packages/gecx-sdk/tests/mcp.test.ts`

## Product API Contract

Keep docs aligned with these current REST routes:

- `GET /health`
- `GET /openapi.json`
- `GET /products`
- `GET /products/{product_id}`
- `POST /compare`
- `GET /categories`
- `GET /facets`
- `POST /cart/estimate`
- `GET /low-stock`
- `GET /financing`
- `GET /card-offers`
- `GET /installment-plans`
- `GET /loyalty`
- `GET /promotions`
- `GET /shipping`
- `GET /returns`
- `GET /warranties`
- `GET /checkout-guidance`

## OpenAPI Product Tool Contract

Keep docs aligned with `infra/terraform/product-openapi.yaml.tftpl` and the
`/products` entries in `services/product-api/main.py`:

- `searchProducts` -> `GET /products`
- `getProductDetails` -> `GET /products/{product_id}`

## MCP Mapping Contract

Keep docs aligned with `services/mcp-server/main.py`:

- `compare_products` -> `POST /compare`
- `get_category_margin_summary` -> `GET /categories`
- `get_low_stock_best_sellers` -> `GET /low-stock`
- `get_financing_options` -> `GET /financing`
- `get_card_offers` -> `GET /card-offers`
- `get_installment_plans` -> `GET /installment-plans`
- `get_loyalty_program_details` -> `GET /loyalty`
- `get_active_promotions` -> `GET /promotions`
- `get_shipping_info` -> `GET /shipping`
- `get_returns_policy` -> `GET /returns`
- `get_warranty_info` -> `GET /warranties`
- `get_checkout_guidance` -> `GET /checkout-guidance`
- `estimate_cart` -> `POST /cart/estimate`

## BigQuery Views

Keep docs aligned with the seed SQL views:

- `vw_product_catalog_current`
- `vw_product_listing_current`
- `vw_product_detail_current`
- `vw_product_facets`
- `vw_category_navigation`
- `vw_cart_pricing_current`
- `vw_low_stock_best_sellers`
- `vw_category_margin_summary`
- `vw_active_financing_options`
- `vw_loyalty_benefits`
- `vw_active_promotions`
- `vw_purchase_support_policies`
- `vw_checkout_support`

## Smoke Tests

Product API:

```bash
PRODUCT_API_URL=$(terraform -chdir=infra/terraform output -raw product_api_url)
curl -sS "$PRODUCT_API_URL/health"
curl -sS "$PRODUCT_API_URL/products?q=driver&limit=5"
curl -sS "$PRODUCT_API_URL/products/P001"
curl -sS "$PRODUCT_API_URL/compare" -H "Content-Type: application/json" -d '{"product_ids":["P001","P002"]}'
curl -sS "$PRODUCT_API_URL/facets"
curl -sS "$PRODUCT_API_URL/cart/estimate" -H "Content-Type: application/json" -d '{"items":[{"product_id":"P001","variant_id":"V0001","quantity":1}]}'
```

MCP:

```bash
MCP_SERVER_URL=$(terraform -chdir=infra/terraform output -raw mcp_server_url)
curl -sS "$MCP_SERVER_URL"
curl -sS "$MCP_SERVER_URL" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
curl -sS "$MCP_SERVER_URL" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"compare_products","arguments":{"product_ids":["P001","P002"]}}}'
```

BigQuery:

```bash
BIGQUERY_DATASET_RESOURCE=$(terraform -chdir=infra/terraform output -raw bigquery_dataset)
BIGQUERY_SQL_DATASET=$(printf "%s" "$BIGQUERY_DATASET_RESOURCE" | sed 's#^projects/##; s#/datasets/#.#')
bq query --use_legacy_sql=false "SELECT COUNT(*) AS row_count FROM \`$BIGQUERY_SQL_DATASET.vw_product_catalog_current\`"
bq query --use_legacy_sql=false "SELECT COUNT(*) AS row_count FROM \`$BIGQUERY_SQL_DATASET.vw_product_listing_current\`"
```

## Acceptance Checklist

- REST endpoint docs match `services/product-api/main.py`.
- MCP tool docs match `services/mcp-server/main.py`.
- BigQuery view docs match the seed SQL.
- Smoke-test commands use Terraform outputs instead of hard-coded URLs.
- Auth notes distinguish public mode from ID-token mode.
