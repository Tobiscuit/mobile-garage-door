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

# ─────────────────────────────────────────────────────────────
# Workers Custom Domain: mobilgaragedoor.com → Workers app
# ─────────────────────────────────────────────────────────────

# Root domain CNAME to the Workers route
resource "cloudflare_record" "root" {
  zone_id = var.cloudflare_zone_id
  name    = "@"
  content = "mobile-garage-door.tobiasramzy.workers.dev"
  type    = "CNAME"
  proxied = true
  comment = "Managed by Terraform: Root domain → Workers"
}

# www CNAME (serves same worker, redirect rule handles canonical)
resource "cloudflare_record" "www" {
  zone_id = var.cloudflare_zone_id
  name    = "www"
  content = "mobile-garage-door.tobiasramzy.workers.dev"
  type    = "CNAME"
  proxied = true
  comment = "Managed by Terraform: www → Workers"
}

# ─────────────────────────────────────────────────────────────
# www → root redirect (canonical URL)
# ─────────────────────────────────────────────────────────────

resource "cloudflare_ruleset" "redirect_www" {
  zone_id     = var.cloudflare_zone_id
  name        = "Redirect www to root"
  description = "301 redirect www.mobilgaragedoor.com to mobilgaragedoor.com"
  kind        = "zone"
  phase       = "http_request_dynamic_redirect"

  rules {
    action = "redirect"
    action_parameters {
      from_value {
        status_code = 301
        target_url {
          expression = "concat(\"https://mobilgaragedoor.com\", http.request.uri.path)"
        }
        preserve_query_string = true
      }
    }
    expression  = "(http.host eq \"www.mobilgaragedoor.com\")"
    description = "301 www → root"
    enabled     = true
  }
}

# ─────────────────────────────────────────────────────────────
# Resend Email DNS Records (for BetterAuth Magic Links)
# ─────────────────────────────────────────────────────────────

# Resend SPF record — allows Resend to send on behalf of this domain
resource "cloudflare_record" "resend_spf" {
  zone_id = var.cloudflare_zone_id
  name    = "@"
  content = "v=spf1 include:amazonses.com ~all"
  type    = "TXT"
  comment = "Managed by Terraform: Resend SPF"
}

# Resend MX for bounce handling
resource "cloudflare_record" "resend_mx" {
  zone_id  = var.cloudflare_zone_id
  name     = "send"
  content  = "feedback-smtp.us-east-1.amazonses.com"
  type     = "MX"
  priority = 10
  comment  = "Managed by Terraform: Resend bounce handling"
}

# Resend DKIM record for domain verification
resource "cloudflare_record" "resend_dkim" {
  zone_id = var.cloudflare_zone_id
  name    = "resend._domainkey"
  content = "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCuuGaGa4Tp2byl6NjmINc87B2dWWCR6EodbsOfncH8Em3i0X0jQG3GLq0g+C/g1fEVyt/VV40EHZ2dixYBiODPHfr30/N0UlZIj+klKlUxfLOMoxIn0O5DfIpe7RePr0aQULSKh0Ppap74MqI4Dw9/+aWgcsrZ+iVQcrc5f6MBsQIDAQAB"
  type    = "TXT"
  comment = "Managed by Terraform: Resend DKIM"
}

# DMARC policy
resource "cloudflare_record" "dmarc" {
  zone_id = var.cloudflare_zone_id
  name    = "_dmarc"
  content = "v=DMARC1; p=none;"
  type    = "TXT"
  comment = "Managed by Terraform: DMARC policy"
}

# ─────────────────────────────────────────────────────────────
# Realtime Proxy: AI Diagnose WebSocket → Gemini Live API
# ─────────────────────────────────────────────────────────────

resource "cloudflare_record" "realtime_proxy" {
  zone_id = var.cloudflare_zone_id
  name    = "realtime-proxy"
  content = "mobile-garage-door-realtime-proxy.tobiasramzy.workers.dev"
  type    = "CNAME"
  proxied = true
  comment = "Managed by Terraform: Realtime proxy → Workers"
}
