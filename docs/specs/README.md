# GECX Specs

This folder contains implementation-ready specs for the Fairway Supply GECX
prototype. Read them in this order when onboarding or validating the system:

1. [Repository Overview](./repo-overview.spec.md)
2. [GECX Research](./gecx-research.spec.md)
3. [Architecture And Data Flow](./architecture-data-flow.spec.md)
4. [End-To-End Test Approach](./e2e-test-approach.spec.md)

The deployed path is the Terraform-created Customer Engagement Suite / GECX app
with a product OpenAPI toolset and an MCP support toolset attached to the root
agent. The Python tools and exported evaluation files under `gecx/` are useful
reference assets, but they are not the primary runtime path unless Terraform or
the agent configuration explicitly wires them in.

## Runtime Inputs

Static site environment variables:

- `VITE_PRODUCT_API_URL`
- `VITE_MCP_SERVER_URL`
- `VITE_GECX_ENABLE_WIDGET`
- `VITE_GECX_PROJECT_ID`
- `VITE_GECX_LOCATION`
- `VITE_GECX_APP_ID`
- `VITE_GECX_DEPLOYMENT_ID`
- `VITE_GECX_AGENT_ID`
- `VITE_GECX_LANGUAGE_CODE`
- `VITE_GECX_CHAT_TITLE`

Terraform outputs used by the site and validation runbooks:

- `product_api_url`
- `mcp_server_url`
- `static_site_url`
- `static_site_image`
- `bigquery_dataset`
- `bigquery_seed_job_id`
- `bigquery_smoke_counts_file`
- `bigquery_smoke_counts_job_id`
- `web_deployment_name`
- `agent_name`
- `app_name`
- `mcp_toolset_name`
- `tool_names`

## Validation Commands

These commands exist in the current package manifests:

```bash
npm run typecheck
npm run test
npm run site:build
npm run test:e2e --workspace apps/static-site
npm run build --workspace packages/gecx-sdk
npm run build --workspace packages/gecx-components
```

Runtime endpoint validation requires a deployed Terraform stack and configured
Google Cloud credentials. See [End-To-End Test Approach](./e2e-test-approach.spec.md).
