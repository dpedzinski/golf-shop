# Fairway Supply Site

Static storefront for the golf customer-service prototype. The first screen is
the shop experience itself: featured golf products, fit guidance, offer context,
and an embedded Golf Store Assistant chat surface when the GECX/Dialogflow CX
configuration is available.

## GECX Chat Configuration

The page reads these runtime environment variables for the Dialogflow CX
Messenger embed:

- `GECX_PROJECT_ID`
- `GECX_LOCATION` defaults to `global`
- `GECX_AGENT_ID` defaults to `golf-store-assistant`
- `GECX_LANGUAGE_CODE` defaults to `en`
- `GECX_CHAT_TITLE` defaults to `Golf Store Assistant`
- `GECX_ENABLE_WIDGET` defaults to `true`; set `false` to hide the widget
- `GECX_OAUTH_CLIENT_ID` is optional for authenticated messenger setups

If `GECX_PROJECT_ID`, `GECX_LOCATION`, or `GECX_AGENT_ID` is missing, the page
renders a configuration notice instead of loading the messenger script.

For local testing, copy `.env.example` to `.env.local` and fill in the values
from the Terraform-created GECX/Dialogflow CX agent.

## Local Development

Install dependencies:

```bash
npm ci --cache .npm-cache
```

Run the local development server:

```bash
npm run dev
```

Validate before hosting:

```bash
npm run lint
npm run build
```

## Hosting

This project is prepared for OpenAI Sites via `.openai/hosting.json`. Once Sites
is enabled for the workspace, create or reuse the Sites project, set the runtime
environment variables above in Sites, save a version from the validated build,
and deploy that saved version to production.
