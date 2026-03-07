variable "cloudflare_api_token" {
  description = "Cloudflare API Token with DNS:Edit permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "The Zone ID for mobilgaragedoor.com"
  type        = string
}
