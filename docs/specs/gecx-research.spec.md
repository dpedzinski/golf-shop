# GECX Research Spec

## Summary

This repo models a Google Customer Engagement Suite / GECX customer service
experience for an online golf store. The web storefront embeds Dialogflow CX
Messenger as a fallback and uses the CES WEB_UI deployment for native chat
sessions when configured. Terraform creates the Customer Engagement Suite app,
root agent, web deployment, and MCP toolset that lets the agent retrieve
BigQuery-backed product, policy, financing, loyalty, and checkout data.

Use the term GECX/CES in this repo to mean the Google customer engagement agent
layer built from Dialogflow CX / Conversational Agents concepts and provisioned
through `infra/terraform`.

## Official Concepts To Track

- CES WEB_UI deployments provide the primary embeddable website chat path in
  this repo. The site uses `CesClient` from `packages/gecx-sdk` to generate a
  public chat token and call `runSession`. Dialogflow CX Messenger remains as a
  fallback when only project, location, and agent IDs are configured.
- Playbook tools connect generative agents to external systems. In this repo,
  the primary deployed external-system connector is the Terraform-created MCP
  toolset, not the direct Python demo tools.
- Playbook evaluations verify agent functionality and prevent regressions with
  test cases, expected tool usage, and golden responses.
- Conversation history export to BigQuery is a separate observability feature
  for live conversation turns. It is different from the product catalog BigQuery
  dataset used by the product API.

Official references:

- Dialogflow CX Messenger: https://docs.cloud.google.com/dialogflow/cx/docs/concept/integration/dialogflow-messenger
- Playbook tools: https://docs.cloud.google.com/dialogflow/cx/docs/concept/playbook/tool
- Playbook evaluations: https://docs.cloud.google.com/dialogflow/cx/docs/concept/playbook/evaluation
- Conversation history export to BigQuery: https://docs.cloud.google.com/dialogflow/cx/docs/concept/export-bq

## Repo Mapping

Primary GECX/CES assets:

- `gecx/agents/golf-store-assistant/instruction.txt`: root agent instruction
  used by Terraform.
- `gecx/agents/golf-store-assistant/Golf_Store_Assistant.json`: exported agent
  metadata for reference.
- `gecx/app/app.json`: exported app metadata for reference.
- `gecx/guardrails/`: exported default safety and prompt guardrail metadata.
- `gecx/evaluations/`: exported evaluation scenarios, currently useful for
  direct tool-matching research and regression design.
- `gecx/tools/python/` and `gecx/tools/definitions/`: direct Python demo tools
  and exported tool definitions. Treat these as reference assets unless a
  deployment explicitly attaches them to the root agent.

Terraform-created GECX/CES resources:

- `google_ces_app.golf_store`
- `google_ces_toolset.golf_store_mcp`
- `google_ces_agent.golf_store_assistant`
- `google_ces_app_root_agent_association.root`
- `google_ces_app_version.web`
- `google_ces_deployment.web`
- `google_ces_tool.python` for demo Python tools, exposed by the `tool_names`
  output but not the root agent's primary BigQuery-backed path.

## Primary Runtime Tool Path

The root agent uses `google_ces_toolset.golf_store_mcp`, whose server address is
the deployed MCP Cloud Function URL plus `/mcp/`. That server exposes JSON-RPC
methods such as `initialize`, `tools/list`, and `tools/call`.

The MCP server lists and calls tools including:

- `search_products`
- `get_product_details`
- `compare_products`
- `get_category_margin_summary`
- `get_low_stock_best_sellers`
- `get_financing_options`
- `get_card_offers`
- `get_installment_plans`
- `get_loyalty_program_details`
- `get_active_promotions`
- `get_shipping_info`
- `get_returns_policy`
- `get_warranty_info`
- `get_checkout_guidance`

Each tool call is translated to a REST call against `services/product-api`, which
queries BigQuery views seeded from
`data/bigquery/golf_store_option_b_bigquery_fixed.sql`.

## Safety And Evaluation Notes

- Financing responses must not guarantee approval or financial outcomes.
- The agent instruction requires the assistant to gather skill level, budget,
  goals, playing style, preferences, and constraints before making product
  recommendations when possible.
- Evaluations should check both answer quality and expected tool usage.
- MCP tool descriptions should remain specific, compact, and aligned with the
  REST endpoints they call.
- Conversation-history BigQuery export, if enabled, should be documented as
  analytics/observability data and not mixed with the product catalog dataset.
