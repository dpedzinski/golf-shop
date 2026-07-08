# End-To-End Test Approach Spec

## Summary

Validate the system in layers, starting from static build and unit tests, then
checking deployed API contracts, MCP JSON-RPC behavior, GECX tool wiring, and
BigQuery data availability.

The target chain is:

website -> GECX -> MCP -> APIs -> BigQuery.

## Prerequisites

- Node.js version compatible with the workspace packages.
- Google Cloud credentials for Terraform, Cloud Functions, BigQuery, and
  Customer Engagement Suite validation.
- Terraform applied from `infra/terraform`.
- Static site deployed from Terraform, or local static site environment
  variables populated from Terraform outputs.

Useful deployed values:

```bash
terraform -chdir=infra/terraform output -raw product_api_url
terraform -chdir=infra/terraform output -raw mcp_server_url
terraform -chdir=infra/terraform output -raw static_site_url
terraform -chdir=infra/terraform output -raw bigquery_dataset
terraform -chdir=infra/terraform output -raw agent_name
terraform -chdir=infra/terraform output -raw mcp_toolset_name
```

## Layer 1: Local Package And Website Checks

Run:

```bash
npm run typecheck
npm run test
npm run site:build
npm run test:e2e --workspace apps/static-site
```

Expected results:

- TypeScript type checks pass across workspaces that define `typecheck`.
- Vitest tests pass for `packages/gecx-sdk` and `packages/gecx-components`.
- Static site builds successfully.
- Playwright confirms storefront widgets render, configured native CES chat can respond, and route-backed shop,
  category, product detail, cart, checkout, and compare pages render.

## Layer 2: Website Runtime Configuration

Copy `apps/static-site/.env.example` to the local environment mechanism used by
the site and populate:

```bash
VITE_PRODUCT_API_URL=<terraform product_api_url>
VITE_MCP_SERVER_URL=<terraform mcp_server_url>
VITE_GECX_ENABLE_WIDGET=true
VITE_GECX_PROJECT_ID=<google cloud project id>
VITE_GECX_LOCATION=<GECX location, usually us for the Terraform stack>
VITE_GECX_APP_ID=golf-store-customer-service
VITE_GECX_DEPLOYMENT_ID=<terraform web_deployment_name>
VITE_GECX_AGENT_ID=golf-store-assistant
VITE_GECX_LANGUAGE_CODE=en
VITE_GECX_CHAT_TITLE=Golf Store Assistant
```

Run the site:

```bash
npm run site:dev
```

Expected results:

- Featured products load from the product API when `VITE_PRODUCT_API_URL` is
  reachable.
- The MCP tools status lists tool names when `VITE_MCP_SERVER_URL` is reachable.
- The assistant section mounts the native CES chat when `VITE_GECX_DEPLOYMENT_ID` is present, or local mock chat when `VITE_GECX_MOCK_ASSISTANT=true`. Without either value, it shows the setup notice.
- If API or MCP endpoints are unavailable, the page degrades to demo product
  data or an MCP status message without crashing.

For the hosted GCP path, open the Cloud Run site:

```bash
STATIC_SITE_URL=$(terraform -chdir=infra/terraform output -raw static_site_url)
```

Expected: the same storefront behavior as local development, with runtime
configuration supplied by Cloud Run environment variables managed in Terraform.

Run the hosted CES chat smoke check:

```bash
STATIC_SITE_URL=$(terraform -chdir=infra/terraform output -raw static_site_url) \
SCREENSHOT_PATH=artifacts/gcp-deployment/static-site-gecx-irons.png \
node scripts/verify-static-site-gecx.mjs
```

Expected: the script sends `I am looking for new Irons for my game`, observes
successful CES `generateChatToken` and `runSession` calls, captures a
screenshot, and prints the assistant's response.

## Layer 2b: CES Evaluation Regressions

The hosted browser smoke verifies the storefront-rendered carousel. The same
irons regressions are also checked inside CES as golden evaluations:

- `Storefront Irons Experienced Player`: sends `I want to shop for irons`, then
  `I want to see irons for experienced players`, and expects a
  CES `search_products` tool call plus NorthLake iron products in the answer.
- `Storefront Irons Yes Retry`: sends `I want to shop for irons`, then `yes`,
  and expects the agent to keep irons context, call `search_products`, and show
  iron products instead of resetting the gear-selection question.

Validate the local evaluation JSON:

```bash
npm run ces:evaluations:validate
```

Terraform syncs and runs these CES evaluations by default during apply. Review
the latest sync/run artifact with:

```bash
terraform -chdir=infra/terraform output -raw ces_evaluation_run_file
```

## Layer 3: API To BigQuery Smoke Tests

Set the product API URL:

```bash
PRODUCT_API_URL=$(terraform -chdir=infra/terraform output -raw product_api_url)
```

Check health:

```bash
curl -sS "$PRODUCT_API_URL/health"
```

Expected: JSON with `status: ok` and the configured dataset name.

Search products:

```bash
curl -sS "$PRODUCT_API_URL/products?q=driver&limit=5"
```

Expected: JSON with `products` and `count`.

Get details:

```bash
curl -sS "$PRODUCT_API_URL/products/P001"
```

Expected: JSON with `product_id` and `variants`, or a 404
`product_not_found` response if `P001` is not present in the active seed data.

Compare products:

```bash
curl -sS "$PRODUCT_API_URL/compare" \
  -H "Content-Type: application/json" \
  -d '{"product_ids":["P001","P002"]}'
```

Expected: JSON with `products` and `missing_product_ids`.

Check listing facets and cart estimate:

```bash
curl -sS "$PRODUCT_API_URL/facets"
curl -sS "$PRODUCT_API_URL/cart/estimate" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"product_id":"P001","variant_id":"V0001","quantity":1}]}'
```

Expected: facets include category/brand/player profile/stock/price groupings,
and cart estimate returns `lines`, `subtotal`, `rewards_points_estimate`,
`financing_hints`, and `shipping_hints`.

Purchase support checks:

```bash
curl -sS "$PRODUCT_API_URL/financing?amount=799"
curl -sS "$PRODUCT_API_URL/loyalty"
curl -sS "$PRODUCT_API_URL/shipping"
curl -sS "$PRODUCT_API_URL/returns?category=CAT_DRIVERS"
curl -sS "$PRODUCT_API_URL/warranties?category=CAT_SHOES"
curl -sS "$PRODUCT_API_URL/checkout-guidance"
```

Expected: JSON collections with `count` where implemented by the endpoint.

## Layer 4: BigQuery Row And View Checks

Terraform applies the seed SQL during `terraform apply`, then runs the core
storefront smoke-count queries and records them as JSON:

```bash
terraform -chdir=infra/terraform output -raw bigquery_smoke_counts_file
```

Use the manual queries below for ad hoc investigation or expanded validation.

Set the dataset output and convert it to the `project.dataset` form expected by
SQL. Terraform may return the dataset as a resource name such as
`projects/PROJECT_ID/datasets/DATASET_ID`.

```bash
BIGQUERY_DATASET_RESOURCE=$(terraform -chdir=infra/terraform output -raw bigquery_dataset)
BIGQUERY_SQL_DATASET=$(printf "%s" "$BIGQUERY_DATASET_RESOURCE" | sed 's#^projects/##; s#/datasets/#.#')
```

Confirm seeded table/view counts:

```bash
bq query --use_legacy_sql=false "
SELECT 'vw_product_catalog_current' AS object_name, COUNT(*) AS row_count
FROM \`$BIGQUERY_SQL_DATASET.vw_product_catalog_current\`
UNION ALL
SELECT 'vw_product_listing_current', COUNT(*)
FROM \`$BIGQUERY_SQL_DATASET.vw_product_listing_current\`
UNION ALL
SELECT 'vw_product_detail_current', COUNT(*)
FROM \`$BIGQUERY_SQL_DATASET.vw_product_detail_current\`
UNION ALL
SELECT 'vw_product_facets', COUNT(*)
FROM \`$BIGQUERY_SQL_DATASET.vw_product_facets\`
UNION ALL
SELECT 'vw_category_navigation', COUNT(*)
FROM \`$BIGQUERY_SQL_DATASET.vw_category_navigation\`
UNION ALL
SELECT 'vw_cart_pricing_current', COUNT(*)
FROM \`$BIGQUERY_SQL_DATASET.vw_cart_pricing_current\`
UNION ALL
SELECT 'vw_active_financing_options', COUNT(*)
FROM \`$BIGQUERY_SQL_DATASET.vw_active_financing_options\`
UNION ALL
SELECT 'vw_purchase_support_policies', COUNT(*)
FROM \`$BIGQUERY_SQL_DATASET.vw_purchase_support_policies\`
UNION ALL
SELECT 'vw_checkout_support', COUNT(*)
FROM \`$BIGQUERY_SQL_DATASET.vw_checkout_support\`
"
```

Expected: each view returns a nonzero row count for the seeded demo dataset.

Confirm active financing and promotion views use dynamic date filters:

```bash
bq query --use_legacy_sql=false "
SELECT 'financing' AS object_name, COUNT(*) AS active_count
FROM \`$BIGQUERY_SQL_DATASET.vw_active_financing_options\`
UNION ALL
SELECT 'promotions', COUNT(*)
FROM \`$BIGQUERY_SQL_DATASET.vw_active_promotions\`
"
```

Expected: rows reflect records active on the query execution date, not a
hard-coded seed date.

Check a product API query against the same view:

```bash
bq query --use_legacy_sql=false "
SELECT product_id, product_name, brand_name, category_name, current_sale_price
FROM \`$BIGQUERY_SQL_DATASET.vw_product_catalog_current\`
ORDER BY product_name
LIMIT 5
"
```

Expected: rows correspond to products returned by `/products`.

## Layer 5: MCP To API Smoke Tests

Set the MCP server URL:

```bash
MCP_SERVER_URL=$(terraform -chdir=infra/terraform output -raw mcp_server_url)
```

Health:

```bash
curl -sS "$MCP_SERVER_URL"
```

Expected: JSON with `status: ok`, `protocolVersion`, `serverInfo`, and tool
names.

List tools:

```bash
curl -sS "$MCP_SERVER_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Expected: JSON-RPC result with a `tools` array.

Call `search_products`:

```bash
curl -sS "$MCP_SERVER_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_products","arguments":{"q":"driver","limit":3}}}'
```

Expected: JSON-RPC result whose `content[0].text` is a JSON string containing
product search data.

Call `compare_products`:

```bash
curl -sS "$MCP_SERVER_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"compare_products","arguments":{"product_ids":["P001","P002"]}}}'
```

Expected: JSON-RPC result with compared products or missing IDs.

## Layer 6: GECX To MCP Validation

Validate the deployed agent in the Conversational Agents / Dialogflow CX console
or through the configured website CES chat.

Test prompts:

- "I am a beginner looking for a forgiving driver under $500."
- "Compare P001 and P002."
- "What financing options are available for a $799 order?"
- "What is your return policy for drivers?"
- "How does the loyalty program work?"

Expected results:

- The agent asks clarifying questions when customer needs are incomplete.
- Product and comparison answers use MCP-backed product data.
- Financing answers include responsible-use language and avoid approval
  guarantees.
- Shipping, returns, warranties, loyalty, and checkout answers map to the
  corresponding MCP tools.
- Tool traces or console validation show the MCP toolset, not only the direct
  Python demo tools, for deployed BigQuery-backed answers.

## Failure Triage

- Website missing chat: check `VITE_GECX_PROJECT_ID`, `VITE_GECX_LOCATION`,
  `VITE_GECX_AGENT_ID`, and `VITE_GECX_ENABLE_WIDGET`.
- Product widgets show demo data: check `VITE_PRODUCT_API_URL`, CORS, product
  API health, and BigQuery permissions.
- MCP tools unavailable in the page: check `VITE_MCP_SERVER_URL`, CORS, and
  `tools/list`.
- MCP tool call fails: check product API URL/auth mode in the MCP function env.
- Product API returns 500: inspect BigQuery dataset env vars, query permissions,
  and seeded view availability.
- GECX does not call tools: check root agent toolset attachment,
  `mcp_toolset_name`, agent instructions, and evaluation/tool traces.
