terraform {
  required_version = ">= 1.5.0"

  required_providers {
    archive = {
      source = "hashicorp/archive"
    }
    google = {
      source = "hashicorp/google"
    }
  }
}

locals {
  repo_root              = abspath("${path.module}/../..")
  product_api_source_dir = "${local.repo_root}/services/product-api"
  mcp_server_source_dir  = "${local.repo_root}/services/mcp-server"
  gecx_tool_python_dir   = "${local.repo_root}/gecx/tools/python"
  agent_instruction_file = "${local.repo_root}/gecx/agents/golf-store-assistant/instruction.txt"
  bigquery_seed_sql_file = "${local.repo_root}/${var.bigquery_seed_sql_file}"

  required_services = toset([
    "artifactregistry.googleapis.com",
    "bigquery.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudfunctions.googleapis.com",
    "ces.googleapis.com",
    "run.googleapis.com",
    "storage.googleapis.com",
  ])

  rendered_seed_sql = replace(
    replace(
      file(local.bigquery_seed_sql_file),
      "`affable-seat-501018-q0.golf_products`",
      "`${var.project_id}.${var.bigquery_dataset_id}`"
    ),
    "location = 'US'",
    "location = '${var.bigquery_location}'"
  )

  agent_instruction = trimspace(file(local.agent_instruction_file))

  python_tools = {
    search_products = {
      function_name = "search_products"
      code_path     = "${local.gecx_tool_python_dir}/search_products.py"
    }
    get_product_details = {
      function_name = "get_product_details"
      code_path     = "${local.gecx_tool_python_dir}/get_product_details.py"
    }
    compare_products = {
      function_name = "compare_products"
      code_path     = "${local.gecx_tool_python_dir}/compare_products.py"
    }
    get_checkout_guidance = {
      function_name = "get_checkout_guidance"
      code_path     = "${local.gecx_tool_python_dir}/get_checkout_guidance.py"
    }
    get_shipping_info = {
      function_name = "get_shipping_info"
      code_path     = "${local.gecx_tool_python_dir}/get_shipping_info.py"
    }
    get_returns_policy = {
      function_name = "get_returns_policy"
      code_path     = "${local.gecx_tool_python_dir}/get_returns_policy.py"
    }
    get_warranty_info = {
      function_name = "get_warranty_info"
      code_path     = "${local.gecx_tool_python_dir}/get_warranty_info.py"
    }
    get_financing_options = {
      function_name = "get_financing_options"
      code_path     = "${local.gecx_tool_python_dir}/get_financing_options.py"
    }
    get_loyalty_program_details = {
      function_name = "get_loyalty_program_details"
      code_path     = "${local.gecx_tool_python_dir}/get_loyalty_program_details.py"
    }
  }
}

provider "google" {
  project = var.project_id
}

data "google_project" "project" {
  project_id = var.project_id
}

resource "google_project_service" "required" {
  for_each = var.enable_required_apis ? local.required_services : toset([])

  project            = var.project_id
  service            = each.key
  disable_on_destroy = false
}

resource "google_bigquery_dataset" "golf_products" {
  project                    = var.project_id
  dataset_id                 = var.bigquery_dataset_id
  friendly_name              = "Golf Products"
  description                = "Synthetic golf retail dataset with products, variants, inventory, reviews, pricing, sales, and performance metrics."
  location                   = var.bigquery_location
  delete_contents_on_destroy = var.bigquery_delete_contents_on_destroy

  depends_on = [google_project_service.required]
}

resource "google_bigquery_job" "seed_golf_products" {
  project  = var.project_id
  location = var.bigquery_location
  job_id   = "seed_golf_products_${substr(sha256(local.rendered_seed_sql), 0, 16)}"

  query {
    query          = local.rendered_seed_sql
    use_legacy_sql = false
  }

  depends_on = [google_bigquery_dataset.golf_products]
}

resource "google_service_account" "product_api" {
  project      = var.project_id
  account_id   = var.product_api_service_account_id
  display_name = "Golf Store Product API"

  depends_on = [google_project_service.required]
}

resource "google_service_account" "mcp_server" {
  project      = var.project_id
  account_id   = var.mcp_server_service_account_id
  display_name = "Golf Store MCP Server"

  depends_on = [google_project_service.required]
}

resource "google_project_iam_member" "product_api_bigquery_job_user" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.product_api.email}"
}

resource "google_bigquery_dataset_iam_member" "product_api_data_viewer" {
  project    = var.project_id
  dataset_id = google_bigquery_dataset.golf_products.dataset_id
  role       = "roles/bigquery.dataViewer"
  member     = "serviceAccount:${google_service_account.product_api.email}"
}

resource "google_storage_bucket" "function_source" {
  project                     = var.project_id
  name                        = coalesce(var.function_source_bucket_name, "${var.project_id}-golf-agent-functions-src")
  location                    = var.function_source_bucket_location
  uniform_bucket_level_access = true
  force_destroy               = true

  depends_on = [google_project_service.required]
}

data "archive_file" "product_api" {
  type        = "zip"
  source_dir  = local.product_api_source_dir
  output_path = "${path.module}/product-api-source.zip"
}

data "archive_file" "mcp_server" {
  type        = "zip"
  source_dir  = local.mcp_server_source_dir
  output_path = "${path.module}/mcp-server-source.zip"
}

resource "google_storage_bucket_object" "product_api_source" {
  name   = "functions/product-api-${data.archive_file.product_api.output_sha256}.zip"
  bucket = google_storage_bucket.function_source.name
  source = data.archive_file.product_api.output_path
}

resource "google_storage_bucket_object" "mcp_server_source" {
  name   = "functions/mcp-server-${data.archive_file.mcp_server.output_sha256}.zip"
  bucket = google_storage_bucket.function_source.name
  source = data.archive_file.mcp_server.output_path
}

resource "google_cloudfunctions2_function" "product_api" {
  project     = var.project_id
  name        = var.product_api_function_name
  location    = var.cloud_functions_region
  description = "Serverless REST API that queries the golf product BigQuery dataset."

  build_config {
    runtime     = var.python_runtime
    entry_point = "handle_request"

    source {
      storage_source {
        bucket = google_storage_bucket.function_source.name
        object = google_storage_bucket_object.product_api_source.name
      }
    }
  }

  service_config {
    available_memory      = var.function_available_memory
    timeout_seconds       = var.product_api_timeout_seconds
    max_instance_count    = var.function_max_instance_count
    service_account_email = google_service_account.product_api.email

    environment_variables = {
      BIGQUERY_PROJECT = var.project_id
      BIGQUERY_DATASET = google_bigquery_dataset.golf_products.dataset_id
      ALLOWED_ORIGINS  = var.allowed_origins
    }
  }

  depends_on = [
    google_bigquery_job.seed_golf_products,
    google_bigquery_dataset_iam_member.product_api_data_viewer,
    google_project_iam_member.product_api_bigquery_job_user,
    google_project_service.required,
  ]
}

resource "google_cloudfunctions2_function" "mcp_server" {
  project     = var.project_id
  name        = var.mcp_server_function_name
  location    = var.cloud_functions_region
  description = "Streamable HTTP-style MCP endpoint that calls the golf product REST API."

  build_config {
    runtime     = var.python_runtime
    entry_point = "handle_request"

    source {
      storage_source {
        bucket = google_storage_bucket.function_source.name
        object = google_storage_bucket_object.mcp_server_source.name
      }
    }
  }

  service_config {
    available_memory      = var.function_available_memory
    timeout_seconds       = var.mcp_server_timeout_seconds
    max_instance_count    = var.function_max_instance_count
    service_account_email = google_service_account.mcp_server.email

    environment_variables = {
      PRODUCT_API_BASE_URL  = google_cloudfunctions2_function.product_api.service_config[0].uri
      PRODUCT_API_AUDIENCE  = google_cloudfunctions2_function.product_api.service_config[0].uri
      PRODUCT_API_AUTH_MODE = var.allow_unauthenticated_serverless ? "none" : "google_id_token"
      ALLOWED_ORIGINS       = var.allowed_origins
    }
  }

  depends_on = [
    google_cloudfunctions2_function.product_api,
    google_project_service.required,
  ]
}

resource "google_cloud_run_v2_service_iam_member" "product_api_public_invoker" {
  count = var.allow_unauthenticated_serverless ? 1 : 0

  project  = var.project_id
  location = google_cloudfunctions2_function.product_api.location
  name     = google_cloudfunctions2_function.product_api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service_iam_member" "mcp_server_public_invoker" {
  count = var.allow_unauthenticated_serverless ? 1 : 0

  project  = var.project_id
  location = google_cloudfunctions2_function.mcp_server.location
  name     = google_cloudfunctions2_function.mcp_server.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service_iam_member" "product_api_mcp_invoker" {
  project  = var.project_id
  location = google_cloudfunctions2_function.product_api.location
  name     = google_cloudfunctions2_function.product_api.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.mcp_server.email}"
}

resource "google_cloud_run_v2_service_iam_member" "mcp_server_ces_invoker" {
  count = var.allow_unauthenticated_serverless ? 0 : 1

  project  = var.project_id
  location = google_cloudfunctions2_function.mcp_server.location
  name     = google_cloudfunctions2_function.mcp_server.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:service-${data.google_project.project.number}@gcp-sa-ces.iam.gserviceaccount.com"
}

resource "google_ces_app" "golf_store" {
  project      = var.project_id
  location     = var.location
  app_id       = var.app_id
  display_name = var.app_display_name
  description  = "Customer service app for an online golf store."

  language_settings {
    default_language_code = var.default_language_code
    fallback_action       = "escalate"
  }

  logging_settings {
    cloud_logging_settings {
      enable_cloud_logging = true
    }
  }

  model_settings {
    model       = var.model
    temperature = var.temperature
  }

  time_zone_settings {
    time_zone = var.time_zone
  }

  global_instruction = "Help golf shoppers choose products, understand purchase policies, and evaluate financing and loyalty options responsibly."

  lifecycle {
    ignore_changes = [root_agent]
  }

  depends_on = [google_project_service.required]
}

resource "google_ces_tool" "python" {
  for_each = local.python_tools

  project        = var.project_id
  location       = google_ces_app.golf_store.location
  app            = google_ces_app.golf_store.app_id
  tool_id        = each.key
  execution_type = "SYNCHRONOUS"

  python_function {
    name        = each.value.function_name
    python_code = file(each.value.code_path)
  }
}

resource "google_ces_toolset" "golf_store_mcp" {
  project      = var.project_id
  location     = google_ces_app.golf_store.location
  app          = google_ces_app.golf_store.app_id
  toolset_id   = var.mcp_toolset_id
  display_name = "Golf Store BigQuery MCP"

  mcp_toolset {
    server_address = "${google_cloudfunctions2_function.mcp_server.service_config[0].uri}/mcp/"

    dynamic "api_authentication" {
      for_each = var.allow_unauthenticated_serverless ? [] : [1]
      content {
        service_agent_id_token_auth_config {}
      }
    }
  }

  depends_on = [
    google_cloudfunctions2_function.mcp_server,
    google_cloud_run_v2_service_iam_member.mcp_server_public_invoker,
    google_cloud_run_v2_service_iam_member.mcp_server_ces_invoker,
  ]
}

resource "google_ces_agent" "golf_store_assistant" {
  project      = var.project_id
  location     = google_ces_app.golf_store.location
  app          = google_ces_app.golf_store.app_id
  agent_id     = var.agent_id
  display_name = var.agent_display_name
  description  = "Friendly golf-store customer service and product recommendation assistant."

  instruction = local.agent_instruction

  model_settings {
    model       = var.model
    temperature = var.temperature
  }

  toolsets {
    toolset = google_ces_toolset.golf_store_mcp.id
  }

  llm_agent {}
}

resource "google_ces_app_root_agent_association" "root" {
  project  = var.project_id
  location = google_ces_app.golf_store.location
  app_id   = google_ces_app.golf_store.app_id
  agent_id = google_ces_agent.golf_store_assistant.agent_id
}
