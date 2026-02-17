param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("owner", "client")]
  [string]$Environment
)

$ErrorActionPreference = "Stop"

if (!(Test-Path "wrangler.toml")) {
  throw "wrangler.toml not found in repository root."
}

$accountEnvName = if ($Environment -eq "owner") { "CLOUDFLARE_ACCOUNT_ID_OWNER" } else { "CLOUDFLARE_ACCOUNT_ID_CLIENT" }
$accountId = [Environment]::GetEnvironmentVariable($accountEnvName)

$args = @("wrangler", "deploy", "--env", $Environment)
if (![string]::IsNullOrWhiteSpace($accountId)) {
  $args += @("--account-id", $accountId)
}

Write-Host "Deploying worker with: npx $($args -join ' ')"
npx @args
