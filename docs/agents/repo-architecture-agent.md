# Repo Architecture Agent

## Mission

Keep `docs/specs/repo-overview.spec.md` and
`docs/specs/architecture-data-flow.spec.md` aligned with the actual repo
structure and runtime wiring.

## Inputs To Inspect

- `package.json`
- `apps/static-site/package.json`
- `apps/static-site/app/page.tsx`
- `apps/static-site/app/storefront-experience.tsx`
- `apps/static-site/.env.example`
- `packages/gecx-sdk/src/product-api.ts`
- `packages/gecx-sdk/src/mcp.ts`
- `packages/gecx-components/src/`
- `services/product-api/main.py`
- `services/mcp-server/main.py`
- `infra/terraform/main.tf`
- `infra/terraform/variables.tf`
- `infra/terraform/outputs.tf`
- `data/bigquery/golf_store_option_b_bigquery_fixed.sql`

## Update Rules

- Start from local repo truth. Do not infer package scripts or endpoint names.
- Treat `apps/static-site` as the canonical storefront app; the older Vertex AI Studio `frontend/` and `backend/` demo path has been removed.
- Preserve the canonical flow as website -> GECX -> MCP -> product API ->
  BigQuery when Terraform still attaches the MCP toolset to the root agent.
- Update the Mermaid diagram if any deployed component, service, or direct
  browser call changes.
- Keep environment variable and Terraform output lists exact.
- Avoid adding production claims for unverified exports under `gecx/`.

## Acceptance Checklist

- Every mentioned path exists or is explicitly described as expected output.
- Every documented script exists in a `package.json`.
- Every endpoint mentioned exists in `services/product-api/main.py` or
  `services/mcp-server/main.py`.
- The architecture spec clearly distinguishes browser status calls from the
  conversational MCP tool path.
