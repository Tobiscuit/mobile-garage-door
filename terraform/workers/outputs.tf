output "worker_script_name" {
  description = "Expected worker script name for Wrangler deploy"
  value       = local.worker_script_name
}

output "routes" {
  description = "Configured worker routes"
  value       = var.routes
}

output "kv_namespace_id" {
  description = "KV namespace ID when create_kv_namespace is true"
  value       = var.create_kv_namespace ? cloudflare_workers_kv_namespace.realtime_cache[0].id : null
}
