variable "cloudflare_api_token" {
  description = "Cloudflare API token with Workers + Zone Route permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID that owns the Worker service"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Zone ID used for route bindings"
  type        = string
}

variable "service_name" {
  description = "Base worker service name"
  type        = string
  default     = "mobile-garage-door-realtime-proxy"
}

variable "environment" {
  description = "Deployment environment label (example: owner or client)"
  type        = string
}

variable "routes" {
  description = "Worker routes to attach (example: ws.example.com/*)"
  type        = list(string)
  default     = []
}

variable "create_kv_namespace" {
  description = "Create a KV namespace for this environment"
  type        = bool
  default     = false
}
