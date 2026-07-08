# Fairway Supply Static Site

Sites/vinext storefront for the golf customer-service prototype. It consumes `@bread-prototype/gecx-sdk` and `@bread-prototype/gecx-components`.

The page reads these runtime environment variables:

- `VITE_PRODUCT_API_URL`
- `VITE_MCP_SERVER_URL`
- `VITE_GECX_PROJECT_ID`
- `VITE_GECX_LOCATION`
- `VITE_GECX_AGENT_ID`
- `VITE_GECX_LANGUAGE_CODE`
- `VITE_GECX_CHAT_TITLE`
- `VITE_GECX_ENABLE_WIDGET`
- `VITE_GECX_OAUTH_CLIENT_ID`

Run locally:

```bash
npm install
npm run build --workspace packages/gecx-sdk
npm run build --workspace packages/gecx-components
npm run site:dev
```
