# Repository Overview Spec

## Summary

This repository is a monorepo for a golf-store customer experience prototype. It
contains a static storefront, reusable GECX SDK and component packages,
serverless MCP and product API services, Terraform infrastructure, exported GECX
agent assets, and BigQuery seed data.

## Primary Areas

- `apps/static-site/`: Vinext/Next-style storefront for the Fairway Supply demo.
  It renders product, comparison, financing, loyalty, and assistant sections.
- `packages/gecx-sdk/`: Browser SDK with `ProductApiClient`, `McpClient`, and
  `CesClient`.
- `packages/gecx-components/`: Web components and Dialogflow CX Messenger custom
  template helpers for rich product and purchase-support widgets.
- `services/product-api/`: Python Cloud Functions Gen 2 REST API that queries
  BigQuery views.
- `services/mcp-server/`: Python Cloud Functions Gen 2 MCP-style JSON-RPC
  endpoint that forwards tool calls to the product API.
- `infra/terraform/`: Google Cloud infrastructure for APIs, BigQuery, Cloud
  Functions, Cloud Run static site hosting, Artifact Registry, service
  accounts, IAM, Customer Engagement Suite app, agent, Python tools, product
  OpenAPI toolset, and MCP toolset.
- `gecx/`: Exported GECX/CES app, root agent, guardrails, tools, evaluations,
  and Python demo tool code.
- `data/bigquery/`: SQL seed file that creates product, inventory, pricing,
  sales, financing, loyalty, promotion, policy, and checkout support tables and
  views.
- Legacy Vertex AI Studio `frontend/` and `backend/` demo directories have been removed; `apps/static-site` is the canonical storefront.

## Runtime Responsibilities

Static site:

- Reads runtime values from `VITE_*` environment variables.
- Calls the product API directly for featured product data.
- Calls the MCP endpoint for tool listing status.
- Mounts the native CES chat when the GECX deployment ID is present.
- Falls back to local demo products if the product API is not configured or is
  unavailable.

SDK:

- `ProductApiClient` builds product API URLs and wraps REST methods.
- `McpClient` sends JSON-RPC requests to the MCP endpoint.
- `CesClient` generates a public web chat token and calls CES `runSession`.

Components:

- Define product list, comparison, financing, payment, offer, loyalty, CTA, and
  generic rich-content custom elements.
- Support direct rendering and Dialogflow CX Messenger custom template payloads.

Product API:

- Exposes `/health`, `/openapi.json`, `/products`, `/products/{product_id}`,
  `/compare`, `/categories`, `/facets`, `/cart/estimate`, `/low-stock`,
  `/financing`, `/card-offers`, `/installment-plans`, `/loyalty`,
  `/promotions`, `/shipping`, `/returns`, `/warranties`, and
  `/checkout-guidance`.
- Reads `BIGQUERY_PROJECT`, `BIGQUERY_DATASET`, and `ALLOWED_ORIGINS`.
- Uses parameterized BigQuery queries.

MCP server:

- Exposes `GET /`, `GET /health`, `GET /mcp`, and `POST /mcp`.
- Supports JSON-RPC `initialize`, `tools/list`, and `tools/call`.
- Reads `PRODUCT_API_BASE_URL`, `PRODUCT_API_AUDIENCE`,
  `PRODUCT_API_AUTH_MODE`, and `ALLOWED_ORIGINS`.
- Uses Google ID-token auth for product API calls when
  `PRODUCT_API_AUTH_MODE=google_id_token`.

Terraform:

- Seeds the BigQuery dataset from `data/bigquery/golf_store_option_b_bigquery_fixed.sql`.
- Deploys the product API and MCP server as Cloud Functions Gen 2.
- Builds the static site container with Cloud Build and deploys it to Cloud Run.
- Creates Customer Engagement Suite app and root agent resources.
- Attaches the product OpenAPI toolset and MCP support toolset to the root agent
  as the primary deployed tool paths.

## Current Scripts

Root scripts:

```bash
npm run build
npm run typecheck
npm run test
npm run site:dev
npm run site:build
```

Static site scripts:

```bash
npm run dev --workspace apps/static-site
npm run build --workspace apps/static-site
npm run typecheck --workspace apps/static-site
npm run test:e2e --workspace apps/static-site
npm run lint --workspace apps/static-site
```

Package scripts:

```bash
npm run build --workspace packages/gecx-sdk
npm run test --workspace packages/gecx-sdk
npm run build --workspace packages/gecx-components
npm run test --workspace packages/gecx-components
```

## Important Defaults

- `VITE_GECX_LOCATION` defaults to `us` in the static site, matching Terraform's Customer Engagement Suite location default.
- `VITE_GECX_APP_ID` defaults to `golf-store-customer-service`.
- `VITE_GECX_DEPLOYMENT_ID` should be set from Terraform's `web_deployment_name` output for the native CES chat path.
- `VITE_GECX_AGENT_ID` defaults to `golf-store-assistant` in the static site.
- Terraform `location` defaults to `us` for Customer Engagement Suite resources.
- Terraform `cloud_functions_region` defaults to `us-central1`.
- Terraform `static_site_region` defaults to `us-central1`.
- Terraform `bigquery_dataset_id` defaults to `golf_products`.
- Terraform `allow_unauthenticated_serverless` defaults to `true`; when false,
  Terraform configures service-to-service and CES service-agent ID-token auth.
