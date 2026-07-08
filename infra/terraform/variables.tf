variable "project_id" {
  description = "Google Cloud project ID where the Customer Engagement Suite app and agent will be created."
  type        = string
}

variable "enable_required_apis" {
  description = "Whether Terraform should enable the Customer Engagement Suite API on the target project."
  type        = bool
  default     = true
}

variable "bigquery_dataset_id" {
  description = "BigQuery dataset ID for the golf product warehouse."
  type        = string
  default     = "golf_products"
}

variable "bigquery_location" {
  description = "BigQuery dataset and seed job location."
  type        = string
  default     = "US"
}

variable "bigquery_delete_contents_on_destroy" {
  description = "Whether Terraform may delete all tables and views inside the BigQuery dataset on destroy."
  type        = bool
  default     = false
}

variable "bigquery_seed_sql_file" {
  description = "SQL file, relative to the repository root, used to create and seed the BigQuery product warehouse."
  type        = string
  default     = "data/bigquery/golf_store_option_b_bigquery_fixed.sql"
}

variable "location" {
  description = "Customer Engagement Suite location. Common values are us and eu."
  type        = string
  default     = "us"
}

variable "cloud_functions_region" {
  description = "Region for the Cloud Functions Gen 2 REST API and MCP server."
  type        = string
  default     = "us-central1"
}

variable "function_source_bucket_name" {
  description = "Optional globally unique GCS bucket name for Cloud Functions source archives. Defaults to <project_id>-golf-agent-functions-src."
  type        = string
  default     = null
}

variable "function_source_bucket_location" {
  description = "Location for the Cloud Functions source bucket."
  type        = string
  default     = "US"
}

variable "python_runtime" {
  description = "Cloud Functions Python runtime."
  type        = string
  default     = "python312"
}

variable "function_available_memory" {
  description = "Memory allocated to each Cloud Function."
  type        = string
  default     = "512M"
}

variable "function_max_instance_count" {
  description = "Maximum instances for each Cloud Function."
  type        = number
  default     = 5
}

variable "product_api_timeout_seconds" {
  description = "Timeout for the product REST API function."
  type        = number
  default     = 60
}

variable "mcp_server_timeout_seconds" {
  description = "Timeout for the MCP server function."
  type        = number
  default     = 60
}

variable "allowed_origins" {
  description = "CORS Access-Control-Allow-Origin value used by the REST API and MCP server."
  type        = string
  default     = "*"
}

variable "allow_unauthenticated_serverless" {
  description = "Whether the product REST API and MCP server are publicly invokable. Set false to use service-to-service and CES service-agent ID-token auth."
  type        = bool
  default     = true
}

variable "product_api_function_name" {
  description = "Cloud Functions Gen 2 function name for the product REST API. Use kebab-case so the Cloud Run service has the same name."
  type        = string
  default     = "golf-store-product-api"
}

variable "mcp_server_function_name" {
  description = "Cloud Functions Gen 2 function name for the MCP server. Use kebab-case so the Cloud Run service has the same name."
  type        = string
  default     = "golf-store-mcp-server"
}

variable "product_api_service_account_id" {
  description = "Service account ID for the product REST API runtime."
  type        = string
  default     = "golf-product-api"
}

variable "mcp_server_service_account_id" {
  description = "Service account ID for the MCP server runtime."
  type        = string
  default     = "golf-mcp-server"
}

variable "mcp_toolset_id" {
  description = "Customer Engagement Suite toolset ID for the deployed MCP server."
  type        = string
  default     = "golf-store-bigquery-mcp"
}

variable "app_id" {
  description = "Stable ID for the Customer Engagement Suite app."
  type        = string
  default     = "golf-store-customer-service"
}

variable "agent_id" {
  description = "Stable ID for the root customer service agent."
  type        = string
  default     = "golf-store-assistant"
}

variable "app_display_name" {
  description = "Display name for the Customer Engagement Suite app."
  type        = string
  default     = "Golf Store Customer Service"
}

variable "agent_display_name" {
  description = "Display name for the customer service agent."
  type        = string
  default     = "Golf Store Assistant"
}

variable "default_language_code" {
  description = "Default BCP-47 language code for the app."
  type        = string
  default     = "en-US"
}

variable "time_zone" {
  description = "IANA time zone used by the app."
  type        = string
  default     = "America/Los_Angeles"
}

variable "model" {
  description = "Gemini model configured for the app and root agent. Change this if your CES project supports a different model name."
  type        = string
  default     = "gemini-3.0-flash-001"
}

variable "temperature" {
  description = "Model sampling temperature."
  type        = number
  default     = 0.4

  validation {
    condition     = var.temperature >= 0 && var.temperature <= 1
    error_message = "temperature must be between 0 and 1."
  }
}
