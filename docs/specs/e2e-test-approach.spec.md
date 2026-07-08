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
- Static site environment variables populated from Terraform outputs.

Useful deployed values:

```bash
terraform -chdir=infra/terraform output -raw product_api_url
terraform -chdir=infra/terraform output -raw mcp_server_url
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
- Playwright confirms storefront widgets render and a configured messenger gets
  the expected `project-id` and `agent-id` attributes.

## Layer 2: Website Runtime Configuration

Copy `apps/static-site/.env.example` to the local environment mechanism used by
the site and populate:

```bash
VITE_PRODUCT_API_URL=<terraform product_api_url>
VITE_MCP_SERVER_URL=<terraform mcp_server_url>
VITE_GECX_ENABLE_WIDGET=true
VITE_GECX_PROJECT_ID=<google cloud project id>
VITE_GECX_LOCATION=<GECX location, usually us or global depending on deployment>
VITE_GECX_AGENT_ID=golf-store-assistant
VITE_GECX_LANGUAGE_CODE=en
VITE_GECX_CHAT_TITLE=Golf Store Assistant
VITE_GECX_OAUTH_CLIENT_ID=
```

Run the site:

```bash
npm run site:dev
```

Expected results:

- Featured products load from the product API when `VITE_PRODUCT_API_URL` is
  reachable.
- The MCP tools status lists tool names when `VITE_MCP_SERVER_URL` is reachable.
- The assistant section mounts `df-messenger` when the GECX values are present.
- If API or MCP endpoints are unavailable, the page degrades to demo product
  data or an MCP status message without crashing.

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
or through the configured website messenger.

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
