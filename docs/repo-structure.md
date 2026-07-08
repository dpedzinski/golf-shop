# Repository Structure

This repo is organized as a monorepo for the GECX golf-store prototype.

## Primary Areas

- `apps/static-site/`: Sites/vinext static storefront that consumes the local SDK and component packages.
- `packages/gecx-sdk/`: Typed browser clients for the product REST API, MCP JSON-RPC endpoint, and GECX messenger mounting.
- `packages/gecx-components/`: Custom elements for storefront widgets and Dialogflow CX Messenger custom rich content.
- `services/product-api/`: Cloud Functions Gen 2 REST API source for BigQuery-backed catalog and purchase-support queries.
- `services/mcp-server/`: Cloud Functions Gen 2 MCP endpoint source that forwards tool calls to the product API.
- `infra/terraform/`: Google Cloud infrastructure for BigQuery, Cloud Functions, CES/GECX app resources, tools, and toolsets.
- `gecx/`: Exported GECX/CES app, agent, skill, guardrail, evaluation, and tool metadata.
- `data/bigquery/`: Seed SQL for the golf product warehouse.

## Supporting Areas

- `frontend/` and `backend/`: Existing Vertex AI Studio demo app and proxy server. These remain separate from the GECX storefront path.
- `docs/`: Repo-level documentation.

## Canonical Sources

- Agent instruction: `gecx/agents/golf-store-assistant/instruction.txt`
- Agent export manifest: `gecx/agents/golf-store-assistant/Golf_Store_Assistant.json`
- Skill metadata: `gecx/skills/*.json`
- Direct Python tool code: `gecx/tools/python/*.py`
- Serverless API source: `services/product-api/`
- Serverless MCP source: `services/mcp-server/`
- Static storefront runtime env example: `apps/static-site/.env.example`

Terraform computes paths from the repository root, so moving generated archives or running Terraform from `infra/terraform` does not require duplicating source code under the infrastructure directory.
