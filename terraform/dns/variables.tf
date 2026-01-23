variable "cloudflare_api_token" {
  description = "Cloudflare API Token with DNS:Edit permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "The Zone ID for jrcodex.dev"
  type        = string
}

variable "coolify_server_ip" {
  description = "The public IP address of the Coolify server/VPS"
  type        = string
}
