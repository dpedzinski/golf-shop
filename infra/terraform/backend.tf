# Terraform Backend Configuration
#
# This configures remote state storage in Google Cloud Storage.
# State locking is enabled by default in GCS backend.
#
# The backend configuration values (bucket, prefix) are provided
# during `terraform init` via GitHub Actions or local development.
#
# For local development:
#   terraform init \
#     -backend-config="bucket=YOUR_PROJECT_ID-terraform-state" \
#     -backend-config="prefix=golf-shop/state"
#
# For GitHub Actions:
#   The workflows automatically configure the backend using secrets:
#   - TF_STATE_BUCKET: GCS bucket name for Terraform state
#   - The prefix is set to "golf-shop/state"

terraform {
  backend "gcs" {
    # Bucket and prefix are provided via -backend-config flags
    # This allows the same configuration to work across environments
  }
}
