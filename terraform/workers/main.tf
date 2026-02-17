locals {
  worker_script_name = "${var.service_name}-${var.environment}"
}

resource "cloudflare_workers_route" "worker_routes" {
  for_each = toset(var.routes)

  zone_id = var.cloudflare_zone_id
  pattern = each.value
  script  = local.worker_script_name
}

resource "cloudflare_workers_kv_namespace" "realtime_cache" {
  count = var.create_kv_namespace ? 1 : 0

  account_id = var.cloudflare_account_id
  title      = "${local.worker_script_name}-kv"
}
