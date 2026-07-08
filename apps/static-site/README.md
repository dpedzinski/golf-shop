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
- `VITE_GECX_LOCATION`: agent location, defaults to `us` to match the Terraform stack
- `VITE_GECX_APP_ID`: Customer Engagement Suite app ID, defaults to `golf-store-customer-service`
- `VITE_GECX_DEPLOYMENT_ID`: Customer Engagement Suite WEB_UI deployment ID from Terraform
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

## GCP Hosting

The Terraform stack in `infra/terraform` deploys this app to Cloud Run. It
builds `apps/static-site/Dockerfile` with Cloud Build, pushes the image to
Artifact Registry, and sets the runtime variables from the deployed Product API,
MCP server, and Customer Engagement Suite WEB_UI deployment.

After `terraform apply`, use the `static_site_url` output as the hosted website.

Run the hosted CES smoke check with:

```bash
STATIC_SITE_URL=$(terraform -chdir=infra/terraform output -raw static_site_url) \
SCREENSHOT_PATH=artifacts/static-site-gecx-irons.png \
node scripts/verify-static-site-gecx.mjs
```

The script submits `I am looking for new Irons for my game`, verifies successful
CES `generateChatToken` and `runSession` calls, and writes a screenshot.
