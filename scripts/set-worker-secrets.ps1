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

$baseArgs = @("wrangler", "secret", "put")
if (![string]::IsNullOrWhiteSpace($accountId)) {
  $baseArgs += @("--account-id", $accountId)
}
$baseArgs += @("--env", $Environment)

$secretNames = @("GEMINI_API_KEY", "ALLOWED_ORIGIN")

foreach ($secretName in $secretNames) {
  Write-Host "Setting secret $secretName for env '$Environment'"
  npx @baseArgs $secretName
}
