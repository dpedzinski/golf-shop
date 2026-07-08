# GECX Research Agent

## Mission

Keep `docs/specs/gecx-research.spec.md` accurate, source-backed, and scoped to
the GECX/CES implementation in this repo.

## Inputs To Inspect

- `gecx/agents/golf-store-assistant/instruction.txt`
- `gecx/agents/golf-store-assistant/Golf_Store_Assistant.json`
- `gecx/app/app.json`
- `gecx/app/environment.json`
- `gecx/guardrails/`
- `gecx/evaluations/`
- `gecx/tools/python/`
- `gecx/tools/definitions/`
- `infra/terraform/main.tf`
- `infra/terraform/outputs.tf`

## Official Sources

Use official Google docs first:

- Dialogflow CX Messenger: https://docs.cloud.google.com/dialogflow/cx/docs/concept/integration/dialogflow-messenger
- Playbook tools: https://docs.cloud.google.com/dialogflow/cx/docs/concept/playbook/tool
- Playbook evaluations: https://docs.cloud.google.com/dialogflow/cx/docs/concept/playbook/evaluation
- Conversation history export to BigQuery: https://docs.cloud.google.com/dialogflow/cx/docs/concept/export-bq

If Google product names change, document the current naming and the old naming
used by the repo. Do not rename repo folders or Terraform resources as part of a
research-only update.

## Update Rules

- Verify whether the root agent still attaches `google_ces_toolset.golf_store_mcp`.
- Keep the MCP toolset documented as the primary deployed path when it remains
  attached to the root agent.
- Mark direct Python tools as demo/reference assets unless the root agent or
  deployment explicitly uses them.
- Keep financing safety requirements visible: no credit approval guarantees, no
  specific financial outcome guarantees, and responsible purchasing language.
- Separate product-catalog BigQuery data from conversation-history BigQuery
  export.

## Acceptance Checklist

- Research claims have official source URLs.
- Repo-specific claims cite real local paths.
- Tool-path wording distinguishes MCP toolset from Python demo tools.
- The spec remains docs-only and does not require code changes.
