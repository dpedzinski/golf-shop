# Fairway Supply Static Site

Sites/Vinext storefront for the golf customer-service prototype. It consumes
`@bread-prototype/gecx-sdk` for the product API and MCP endpoints, and
`@bread-prototype/gecx-components` for reusable product, comparison, financing,
and loyalty widgets.

## Runtime Configuration

The page reads these runtime environment variables:

- `VITE_PRODUCT_API_URL`: Cloud Run/Functions product API base URL
- `VITE_MCP_SERVER_URL`: MCP server endpoint used to list available tools
- `VITE_GECX_PROJECT_ID`: Google Cloud project for the GECX/Dialogflow CX agent
- `VITE_GECX_LOCATION`: agent location, defaults to `global`
- `VITE_GECX_AGENT_ID`: agent ID, defaults to `golf-store-assistant`
- `VITE_GECX_LANGUAGE_CODE`: defaults to `en`
- `VITE_GECX_CHAT_TITLE`: defaults to `Golf Store Assistant`
- `VITE_GECX_ENABLE_WIDGET`: defaults to `true`; set `false` to hide chat
- `VITE_GECX_OAUTH_CLIENT_ID`: optional for authenticated messenger setups

If the GECX project, location, or agent ID is missing, the page renders a setup
notice instead of mounting the chat widget.

Copy `.env.example` to `.env.local` for local testing, then fill in the
Terraform outputs for the product API, MCP server, and GECX agent.

## Local Development

Run locally:

```bash
npm install --cache .npm-cache
npm run build --workspace packages/gecx-sdk
npm run build --workspace packages/gecx-components
npm run site:dev
```

Validate before hosting:

```bash
npm run typecheck
npm run site:build
```

## Hosting

This app is prepared for OpenAI Sites via `.openai/hosting.json`. Once Sites is
enabled for the workspace, create or reuse the Sites project, set the runtime
environment variables above in Sites, save a version from the validated build,
and deploy that saved version to production.
