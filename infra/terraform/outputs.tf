output "app_name" {
  description = "Fully qualified Customer Engagement Suite app resource name."
  value       = google_ces_app.golf_store.name
}

output "bigquery_dataset" {
  description = "BigQuery dataset seeded from the local SQL file."
  value       = google_bigquery_dataset.golf_products.id
}

output "bigquery_seed_job_id" {
  description = "BigQuery SQL job that created and loaded the product warehouse."
  value       = "projects/${var.project_id}/jobs/${terraform_data.seed_golf_products.output.job_id}"
}

output "bigquery_smoke_counts_file" {
  description = "Local JSON artifact written by Terraform with post-seed BigQuery smoke row counts."
  value       = terraform_data.bigquery_smoke_counts.output.artifact_path
}

output "bigquery_smoke_counts_job_id" {
  description = "BigQuery SQL job that recorded post-seed smoke row counts."
  value       = "projects/${var.project_id}/jobs/${terraform_data.bigquery_smoke_counts.output.job_id}"
}

output "ces_evaluation_run_file" {
  description = "Local JSON artifact written by Terraform with CES evaluation sync and run details."
  value       = var.sync_ces_evaluations ? terraform_data.ces_evaluations[0].output.artifact_path : null
}

output "agent_name" {
  description = "Fully qualified root agent resource name."
  value       = google_ces_agent.golf_store_assistant.name
}

output "product_api_url" {
  description = "Serverless REST API URL for BigQuery-backed product queries."
  value       = google_cloudfunctions2_function.product_api.service_config[0].uri
}

output "mcp_server_url" {
  description = "MCP Streamable HTTP-style endpoint URL."
  value       = "${google_cloudfunctions2_function.mcp_server.service_config[0].uri}/mcp/"
}

output "static_site_url" {
  description = "Public Cloud Run URL for the static storefront."
  value       = google_cloud_run_v2_service.static_site.uri
}

output "static_site_image" {
  description = "Artifact Registry image deployed to the static storefront Cloud Run service."
  value       = terraform_data.build_static_site_image.output.image
}

output "mcp_toolset_name" {
  description = "Customer Engagement Suite MCP toolset attached to the root agent for non-product support tools."
  value       = google_ces_toolset.golf_store_mcp.name
}

output "product_openapi_toolset_name" {
  description = "Customer Engagement Suite OpenAPI toolset attached to the root agent for product search and product details."
  value       = google_ces_toolset.golf_store_product_openapi.name
}

output "web_deployment_name" {
  description = "Customer Engagement Suite WEB_UI deployment used for website chat sessions."
  value       = google_ces_deployment.web.name
}

output "tool_names" {
  description = "Fully qualified Python demo tool resource names. The root agent uses product OpenAPI plus MCP toolsets by default."
  value       = { for key, tool in google_ces_tool.python : key => tool.id }
}
