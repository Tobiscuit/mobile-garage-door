terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_record" "garage_door" {
  zone_id = var.cloudflare_zone_id
  name    = "garage-door"
  content = var.coolify_server_ip
  type    = "A"
  proxied = true
  comment = "Managed by Terraform: Mobile Garage Door Project"
}
