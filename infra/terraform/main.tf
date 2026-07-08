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
  repo_root                  = abspath("${path.module}/../..")
  product_api_source_dir     = "${local.repo_root}/services/product-api"
  mcp_server_source_dir      = "${local.repo_root}/services/mcp-server"
  static_site_source_dir     = "${local.repo_root}/apps/static-site"
  gecx_tool_python_dir       = "${local.repo_root}/gecx/tools/python"
  agent_instruction_file     = "${local.repo_root}/gecx/agents/golf-store-assistant/instruction.txt"
  bigquery_seed_sql_file     = "${local.repo_root}/${var.bigquery_seed_sql_file}"
  bigquery_smoke_counts_file = "${local.repo_root}/artifacts/terraform/bigquery-smoke-counts.json"

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

  bigquery_smoke_counts_sql = <<-SQL
    SELECT 'vw_product_listing_current' AS object_name, COUNT(*) AS row_count
    FROM `${var.project_id}.${var.bigquery_dataset_id}.vw_product_listing_current`
    UNION ALL
    SELECT 'vw_product_detail_current', COUNT(*)
    FROM `${var.project_id}.${var.bigquery_dataset_id}.vw_product_detail_current`
    UNION ALL
    SELECT 'vw_product_facets', COUNT(*)
    FROM `${var.project_id}.${var.bigquery_dataset_id}.vw_product_facets`
    UNION ALL
    SELECT 'vw_category_navigation', COUNT(*)
    FROM `${var.project_id}.${var.bigquery_dataset_id}.vw_category_navigation`
    UNION ALL
    SELECT 'vw_cart_pricing_current', COUNT(*)
    FROM `${var.project_id}.${var.bigquery_dataset_id}.vw_cart_pricing_current`
    UNION ALL
    SELECT 'vw_active_financing_options', COUNT(*)
    FROM `${var.project_id}.${var.bigquery_dataset_id}.vw_active_financing_options`
    UNION ALL
    SELECT 'vw_active_promotions', COUNT(*)
    FROM `${var.project_id}.${var.bigquery_dataset_id}.vw_active_promotions`
  SQL

  agent_instruction = trimspace(file(local.agent_instruction_file))

  static_site_app_files = [
    for path in fileset(local.static_site_source_dir, "**") : "apps/static-site/${path}"
    if !contains([".vinext", ".vite", ".wrangler", "coverage", "dist", "node_modules", "playwright-report", "test-results"], split("/", path)[0])
    && !contains(split("/", path), ".wrangler")
    && !endswith(path, ".tsbuildinfo")
    && (path == ".env.example" || !startswith(path, ".env"))
  ]

  static_site_sdk_files = [
    for path in fileset("${local.repo_root}/packages/gecx-sdk", "**") : "packages/gecx-sdk/${path}"
    if !contains(["coverage", "dist", "node_modules"], split("/", path)[0])
    && !endswith(path, ".tsbuildinfo")
  ]

  static_site_component_files = [
    for path in fileset("${local.repo_root}/packages/gecx-components", "**") : "packages/gecx-components/${path}"
    if !contains([".playwright-browsers", "coverage", "dist", "node_modules", "playwright-report", "test-results"], split("/", path)[0])
    && !endswith(path, ".tsbuildinfo")
  ]

  static_site_source_files = sort(concat(
    [
      ".dockerignore",
      ".gcloudignore",
      "package.json",
      "package-lock.json",
    ],
    local.static_site_app_files,
    local.static_site_sdk_files,
    local.static_site_component_files,
  ))

  static_site_source_hash = substr(sha256(join("", [
    for path in local.static_site_source_files : filesha256("${local.repo_root}/${path}")
  ])), 0, 16)

  static_site_image = "${var.static_site_region}-docker.pkg.dev/${var.project_id}/${var.static_site_artifact_repository_id}/${var.static_site_service_name}:${local.static_site_source_hash}"

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

resource "terraform_data" "seed_golf_products" {
  input = {
    job_id = "seed_golf_products_cli_${substr(sha256(local.rendered_seed_sql), 0, 16)}"
  }

  triggers_replace = {
    project_id          = var.project_id
    dataset_id          = var.bigquery_dataset_id
    location            = var.bigquery_location
    rendered_sql_sha256 = sha256(local.rendered_seed_sql)
  }

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command     = <<-EOT
      set -euo pipefail
      tmp_sql="$(mktemp)"
      cleanup() {
        rm -f "$tmp_sql"
      }
      trap cleanup EXIT

      sed \
        -e 's|`affable-seat-501018-q0\.golf_products`|`${var.project_id}.${var.bigquery_dataset_id}`|g' \
        -e "s|location = 'US'|location = '${var.bigquery_location}'|g" \
        '${local.bigquery_seed_sql_file}' > "$tmp_sql"

      bq query \
        --project_id='${var.project_id}' \
        --location='${var.bigquery_location}' \
        --job_id='${self.input.job_id}' \
        --use_legacy_sql=false \
        --format=none \
        < "$tmp_sql"
    EOT
  }

  depends_on = [google_bigquery_dataset.golf_products]
}

resource "terraform_data" "bigquery_smoke_counts" {
  input = {
    artifact_path = local.bigquery_smoke_counts_file
    job_id        = "smoke_golf_products_cli_${substr(sha256(join("\n", [local.rendered_seed_sql, local.bigquery_smoke_counts_sql, "json_writer_v2"])), 0, 16)}"
  }

  triggers_replace = {
    artifact_writer_version = "json_writer_v2"
    project_id              = var.project_id
    dataset_id              = var.bigquery_dataset_id
    location                = var.bigquery_location
    seed_job_id             = terraform_data.seed_golf_products.output.job_id
    smoke_sql_sha256        = sha256(local.bigquery_smoke_counts_sql)
  }

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command     = <<-EOT
      set -euo pipefail
      tmp_sql="$(mktemp)"
      artifact_path='${self.input.artifact_path}'
      cleanup() {
        rm -f "$tmp_sql"
      }
      trap cleanup EXIT

      mkdir -p "$(dirname "$artifact_path")"
      cat > "$tmp_sql" <<'SQL'
      ${local.bigquery_smoke_counts_sql}
      SQL

      rows_json="$(bq query \
        --project_id='${var.project_id}' \
        --location='${var.bigquery_location}' \
        --job_id='${self.input.job_id}' \
        --use_legacy_sql=false \
        --format=json \
        < "$tmp_sql")"

      ROWS_JSON="$rows_json" python3 - <<'PY'
      import json
      import os

      artifact_path = os.environ["ARTIFACT_PATH"]
      payload = {
          "project_id": os.environ["PROJECT_ID"],
          "dataset_id": os.environ["DATASET_ID"],
          "location": os.environ["LOCATION"],
          "seed_job_id": os.environ["SEED_JOB_ID"],
          "smoke_job_id": os.environ["SMOKE_JOB_ID"],
          "row_counts": json.loads(os.environ["ROWS_JSON"]),
      }
      with open(artifact_path, "w", encoding="utf-8") as handle:
          json.dump(payload, handle, indent=2, sort_keys=True)
          handle.write("\n")
      print(json.dumps(payload, indent=2, sort_keys=True))
      PY
    EOT

    environment = {
      ARTIFACT_PATH = self.input.artifact_path
      DATASET_ID    = var.bigquery_dataset_id
      LOCATION      = var.bigquery_location
      PROJECT_ID    = var.project_id
      SEED_JOB_ID   = terraform_data.seed_golf_products.output.job_id
      SMOKE_JOB_ID  = self.input.job_id
    }
  }

  depends_on = [terraform_data.seed_golf_products]
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

resource "google_service_account" "static_site" {
  project      = var.project_id
  account_id   = var.static_site_service_account_id
  display_name = "Golf Store Static Site"

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
    terraform_data.seed_golf_products,
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

resource "google_artifact_registry_repository" "static_site" {
  project       = var.project_id
  location      = var.static_site_region
  repository_id = var.static_site_artifact_repository_id
  description   = "Docker images for the golf store static site."
  format        = "DOCKER"

  depends_on = [google_project_service.required]
}

resource "google_project_iam_member" "cloudbuild_static_site_artifact_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"

  depends_on = [google_project_service.required]
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

resource "google_ces_app_version" "web" {
  project        = var.project_id
  location       = google_ces_app.golf_store.location
  app            = google_ces_app.golf_store.app_id
  app_version_id = var.app_version_id
  display_name   = "Web storefront version"
  description    = "Snapshot used by the storefront web deployment."

  depends_on = [google_ces_app_root_agent_association.root]
}

resource "google_ces_deployment" "web" {
  project      = var.project_id
  location     = google_ces_app.golf_store.location
  app          = google_ces_app.golf_store.app_id
  display_name = var.deployment_display_name
  app_version  = google_ces_app_version.web.id

  channel_profile {
    channel_type = "WEB_UI"

    web_widget_config {
      modality         = "CHAT_ONLY"
      theme            = "LIGHT"
      web_widget_title = var.agent_display_name

      security_settings {
        enable_public_access = true
        enable_origin_check  = false
        enable_recaptcha     = false
      }
    }
  }
}

resource "terraform_data" "build_static_site_image" {
  input = {
    image       = local.static_site_image
    source_hash = local.static_site_source_hash
  }

  triggers_replace = {
    image = local.static_site_image
  }

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command     = <<-EOT
      set -euo pipefail
      gcloud builds submit '${local.repo_root}' \
        --project='${var.project_id}' \
        --region='${var.static_site_region}' \
        --config='${local.static_site_source_dir}/cloudbuild.yaml' \
        --substitutions='_IMAGE=${local.static_site_image}' \
        --timeout='${var.static_site_build_timeout}'
    EOT
  }

  depends_on = [
    google_artifact_registry_repository.static_site,
    google_project_iam_member.cloudbuild_static_site_artifact_writer,
  ]
}

resource "google_cloud_run_v2_service" "static_site" {
  project             = var.project_id
  location            = var.static_site_region
  name                = var.static_site_service_name
  deletion_protection = false
  ingress             = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.static_site.email
    timeout         = "${var.static_site_request_timeout_seconds}s"

    scaling {
      min_instance_count = var.static_site_min_instance_count
      max_instance_count = var.static_site_max_instance_count
    }

    containers {
      image = local.static_site_image

      ports {
        container_port = 8080
      }

      env {
        name  = "VITE_PRODUCT_API_URL"
        value = google_cloudfunctions2_function.product_api.service_config[0].uri
      }

      env {
        name  = "VITE_MCP_SERVER_URL"
        value = "${google_cloudfunctions2_function.mcp_server.service_config[0].uri}/mcp/"
      }

      env {
        name  = "VITE_GECX_ENABLE_WIDGET"
        value = "true"
      }

      env {
        name  = "VITE_GECX_PROJECT_ID"
        value = var.project_id
      }

      env {
        name  = "VITE_GECX_LOCATION"
        value = google_ces_app.golf_store.location
      }

      env {
        name  = "VITE_GECX_APP_ID"
        value = google_ces_app.golf_store.app_id
      }

      env {
        name  = "VITE_GECX_DEPLOYMENT_ID"
        value = google_ces_deployment.web.name
      }

      env {
        name  = "VITE_GECX_AGENT_ID"
        value = google_ces_agent.golf_store_assistant.agent_id
      }

      env {
        name  = "VITE_GECX_LANGUAGE_CODE"
        value = "en"
      }

      env {
        name  = "VITE_GECX_CHAT_TITLE"
        value = var.agent_display_name
      }

      resources {
        limits = {
          cpu    = var.static_site_cpu
          memory = var.static_site_memory
        }
      }
    }
  }

  depends_on = [
    terraform_data.build_static_site_image,
    google_ces_deployment.web,
    google_cloudfunctions2_function.product_api,
    google_cloudfunctions2_function.mcp_server,
  ]
}

resource "google_cloud_run_v2_service_iam_member" "static_site_public_invoker" {
  project  = var.project_id
  location = google_cloud_run_v2_service.static_site.location
  name     = google_cloud_run_v2_service.static_site.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
