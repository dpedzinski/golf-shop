# Fairway Supply GECX Golf Shop

This repository contains the Fairway Supply golf-store prototype. The canonical runnable app is the Vinext/Next static storefront in `apps/static-site`, backed by local SDK/component packages and optional Google Cloud Product API, MCP, and GECX/CES integrations.

The project is intended for demonstration and prototyping purposes only. It is not intended for production use as-is.

## Primary Areas

- `apps/static-site/`: Canonical storefront app with shop, category, product detail, cart, checkout, compare, and assistant/demo widget flows.
- `packages/gecx-sdk/`: Browser clients for the product REST API, MCP JSON-RPC endpoint, CES chat sessions, and messenger fallback.
- `packages/gecx-components/`: Reusable storefront web components and Dialogflow CX Messenger rich-content helpers.
- `services/product-api/`: BigQuery-backed Product API source for Google Cloud Functions.
- `services/mcp-server/`: MCP endpoint source that forwards tool calls to the Product API.
- `infra/terraform/`: Google Cloud deployment stack.
- `gecx/`: Exported GECX/CES app, agent, tool, skill, guardrail, and evaluation metadata.

## Local Demo

Install dependencies and run the canonical local storefront:

```bash
npm install --cache .npm-cache
npm run site:dev
```

For a fully local mock assistant/demo-data experience, create `apps/static-site/.env.local` from `.env.example` and set:

```env
VITE_GECX_PROJECT_ID=demo-project
VITE_GECX_MOCK_ASSISTANT=true
VITE_PRODUCT_API_URL=
VITE_MCP_SERVER_URL=
```

This runs the storefront locally with demo product data and mock assistant behavior. The real Product API, MCP server, and GECX/CES assistant paths still require Google Cloud configuration.

## Validation

```bash
npm run typecheck
npm run test
npm run build --workspaces --if-present
```
