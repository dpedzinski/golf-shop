# Integration Test Agent

## Mission

Validate and maintain `docs/specs/e2e-test-approach.spec.md`, covering the full
website -> GECX -> product OpenAPI / MCP -> API -> BigQuery chain.

## Inputs To Inspect

- `package.json`
- `apps/static-site/package.json`
- `apps/static-site/playwright.config.ts`
- `apps/static-site/e2e/storefront.spec.ts`
- `apps/static-site/.env.example`
- `packages/gecx-sdk/tests/`
- `packages/gecx-components/tests/`
- `infra/terraform/outputs.tf`
- `services/product-api/main.py`
- `services/mcp-server/main.py`

## Validation Order

1. Confirm documented package scripts exist.
2. Run local typecheck, unit tests, and builds when requested by the user.
3. Validate the Cloud Run static site URL and env values from Terraform outputs.
4. Smoke test product API endpoints.
5. Smoke test MCP health, `tools/list`, and `tools/call`.
6. Validate GECX/CES OpenAPI and MCP toolset behavior through the console or website CES chat.
7. Confirm BigQuery seeded views return rows.

## Commands To Keep Current

```bash
npm run typecheck
npm run test
npm run site:build
npm run test:e2e --workspace apps/static-site
terraform -chdir=infra/terraform output -raw product_api_url
terraform -chdir=infra/terraform output -raw mcp_server_url
terraform -chdir=infra/terraform output -raw static_site_url
terraform -chdir=infra/terraform output -raw bigquery_dataset
```

## Expected Signals

- Static site Playwright test finds storefront widgets and configured native chat behavior. Component package coverage is handled by Vitest unit tests.
- Product API `/health` returns `status: ok`.
- Product API `/products` returns product data from BigQuery-backed views.
- MCP `tools/list` returns the expected non-product support tool names.
- MCP `tools/call` returns JSON-RPC results with text content containing API
  response JSON.
- GECX tool traces show the deployed product OpenAPI toolset for product search/details and the MCP toolset for support answers.

## Triage Rules

- If the website fails before hitting APIs, inspect site env vars and Playwright
  config first.
- If direct API smoke tests fail, inspect BigQuery env vars, IAM, seeded views,
  and Cloud Function logs.
- If MCP smoke tests fail but API tests pass, inspect MCP env vars, product API
  auth mode, and Cloud Function logs.
- If GECX does not call tools but direct Product API and MCP tests pass, inspect
  root agent toolset attachments, agent instruction, and console traces.
