# Golf Store Customer Service Agent

This Terraform scaffold creates a Google Cloud Customer Engagement Suite app with a Gemini-powered root agent for an online golf store.

It creates:

- Required API enablement by default: CES, BigQuery, Cloud Functions, Cloud Build, Cloud Run, Artifact Registry, and Cloud Storage.
- A BigQuery dataset seeded from `../../data/bigquery/golf_store_option_b_bigquery_fixed.sql`.
- A Cloud Functions Gen 2 REST API that queries the seeded BigQuery product views.
- A Cloud Functions Gen 2 MCP endpoint that calls the REST API.
- An Artifact Registry repository and Cloud Run service for the static storefront.
- A `google_ces_app`.
- A root `google_ces_agent`.
- A `google_ces_app_root_agent_association`.
- A `google_ces_toolset` pointing at the MCP endpoint.
- Python-backed CES demo tools are provisioned; the root agent attaches the
  first-class `search_products` tool for reliable native tool calling and keeps
  the BigQuery-backed MCP toolset for catalog and purchase-support tools.
- CES regression evaluations for the storefront irons flows. Terraform syncs
  the checked-in evaluation JSON files to CES and, by default, starts a
  fake-tool evaluation run after the app, agent, version, deployment, and
  toolset are present.

## Usage

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars and set project_id.
terraform init
terraform plan
terraform apply
```

The direct CES Python tools return demo data. The MCP toolset calls the deployed serverless REST API, which queries the BigQuery views created by the SQL seed script. The seed script is applied with the `bq` CLI because BigQuery multi-statement scripts cannot be run through the Terraform BigQuery job resource's default destination-table settings. After the seed job, Terraform runs the storefront smoke-count queries and writes the results to `artifacts/terraform/bigquery-smoke-counts.json`.

Useful endpoints after `terraform apply`:

- `static_site_url`: public Cloud Run storefront URL
- `bigquery_smoke_counts_file`: local JSON artifact containing post-seed BigQuery view row counts
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

The static storefront is deployed to Cloud Run because the Vinext app has a server runtime in addition to client assets. Terraform submits the repository to Cloud Build, builds `apps/static-site/Dockerfile`, pushes the image to Artifact Registry, and deploys the Cloud Run service with runtime environment variables populated from the Terraform-managed Product API, MCP server, and CES WEB_UI deployment. Keep `allow_unauthenticated_serverless = true` for the current browser-facing storefront path; if the API and MCP services are made private, add a backend proxy before exposing the site publicly.

## CES evaluations

The storefront irons regressions are also represented as CES golden
evaluations:

- `gecx/evaluations/Storefront_Irons_Experienced_Player/Storefront_Irons_Experienced_Player.json`
- `gecx/evaluations/Storefront_Irons_Yes_Retry/Storefront_Irons_Yes_Retry.json`

Validate the checked-in JSON without calling Google APIs:

```bash
npm run ces:evaluations:validate
```

On `terraform apply`, `scripts/sync-ces-evaluations.mjs` creates or updates
those CES evaluations through the v1beta CES API, then runs them with fake tool
responses so the tests check agent behavior and expected CES tool usage without
calling the live product API. The result artifact path is available from:

```bash
terraform -chdir=infra/terraform output -raw ces_evaluation_run_file
```

Set `run_ces_evaluations = false` to sync the evaluations without starting a
run, or `sync_ces_evaluations = false` to skip this Terraform step entirely.

The seed SQL is written for clean reruns: it drops and recreates the views/tables inside `bigquery_dataset_id` before inserting the fixture data.

## BigQuery Smoke Counts

`terraform apply` runs the seed SQL and then records row counts for:

- `vw_product_listing_current`
- `vw_product_detail_current`
- `vw_product_facets`
- `vw_category_navigation`
- `vw_cart_pricing_current`
- `vw_active_financing_options`
- `vw_active_promotions`

Read the artifact path with:

```bash
terraform output -raw bigquery_smoke_counts_file
```

The JSON file is generated under `artifacts/`, which is ignored by Git.
