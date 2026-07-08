# Golf Store Customer Service Agent

This Terraform scaffold creates a Google Cloud Customer Engagement Suite app with a Gemini-powered root agent for an online golf store.

It creates:

- Required API enablement by default: CES, BigQuery, Cloud Functions, Cloud Build, Cloud Run, Artifact Registry, and Cloud Storage.
- A BigQuery dataset seeded from `../../data/bigquery/golf_store_option_b_bigquery_fixed.sql`.
- A Cloud Functions Gen 2 REST API that queries the seeded BigQuery product views.
- A Cloud Functions Gen 2 MCP endpoint that calls the REST API.
- A `google_ces_app`.
- A root `google_ces_agent`.
- A `google_ces_app_root_agent_association`.
- A `google_ces_toolset` pointing at the MCP endpoint.
- Python-backed CES demo tools are still provisioned, but the root agent uses the BigQuery-backed MCP toolset by default.

## Usage

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars and set project_id.
terraform init
terraform plan
terraform apply
```

The direct CES Python tools return demo data. The MCP toolset calls the deployed serverless REST API, which queries the BigQuery views created by the SQL seed job.

Useful endpoints after `terraform apply`:

- `GET <product_api_url>/health`
- `GET <product_api_url>/products?q=driver&limit=5`
- `GET <product_api_url>/products/{product_id}`
- `POST <product_api_url>/compare` with `{"product_ids":["P001","P002"]}`
- `GET <product_api_url>/categories`
- `GET <product_api_url>/low-stock`
- `GET <product_api_url>/financing?amount=799`
- `GET <product_api_url>/card-offers?amount=799`
- `GET <product_api_url>/installment-plans?amount=799`
- `GET <product_api_url>/loyalty`
- `GET <product_api_url>/promotions?category=CAT_DRIVERS`
- `GET <product_api_url>/shipping`
- `GET <product_api_url>/returns?category=CAT_DRIVERS`
- `GET <product_api_url>/warranties?category=CAT_SHOES`
- `GET <product_api_url>/checkout-guidance`
- `POST <mcp_server_url>` with JSON-RPC methods such as `tools/list` and `tools/call`

If your Google Cloud project uses a different supported Gemini model for Customer Engagement Suite, override `model` in `terraform.tfvars`.

Set `allow_unauthenticated_serverless = false` to keep the functions private. Terraform will grant the MCP runtime service account permission to call the REST API and will configure the CES MCP toolset to use service-agent ID-token auth for the MCP server.

The seed SQL is written for clean reruns: it drops and recreates the views/tables inside `bigquery_dataset_id` before inserting the fixture data.
