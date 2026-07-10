# GECX Agent Handoffs

This folder contains handoff files for future AI or coding agents that need to
maintain the GECX documentation and integration checks.

Use these files by task:

- [GECX Research Agent](./gecx-research-agent.md): update official research and
  source references.
- [Repo Architecture Agent](./repo-architecture-agent.md): keep repo overview
  and architecture/data-flow specs accurate.
- [Integration Test Agent](./integration-test-agent.md): validate the full
  website -> GECX -> product OpenAPI / MCP -> API -> BigQuery chain.
- [BigQuery API Agent](./bigquery-api-agent.md): focus on product API,
  BigQuery, and MCP-to-API behavior.

Ground rules:

- Treat the Terraform-created product OpenAPI toolset as the primary deployed
  path for product search/details and the MCP toolset as the primary deployed
  path for support tools.
- Do not describe `gecx/tools/python` or `gecx/evaluations` as production
  runtime paths unless the repo wiring proves that they are attached to the
  deployed root agent.
- Prefer repo inspection and official Google documentation over guesses.
- Keep docs aligned with package scripts and Terraform outputs.
