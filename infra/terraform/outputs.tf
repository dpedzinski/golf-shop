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
  value       = google_bigquery_job.seed_golf_products.id
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

output "mcp_toolset_name" {
  description = "Customer Engagement Suite MCP toolset attached to the root agent."
  value       = google_ces_toolset.golf_store_mcp.name
}

output "tool_names" {
  description = "Fully qualified Python demo tool resource names. The root agent uses the BigQuery-backed MCP toolset by default."
  value       = { for key, tool in google_ces_tool.python : key => tool.id }
}
