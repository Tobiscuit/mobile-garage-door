param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("owner", "client")]
  [string]$Environment
)

$ErrorActionPreference = "Stop"
$WorkerPath = "workers/realtime-proxy"

if (Test-Path $WorkerPath) {
    Write-Host "Changing directory to $WorkerPath"
    Push-Location $WorkerPath
} else {
    throw "Worker directory $WorkerPath not found"
}

if (!(Test-Path "wrangler.toml")) {
  Pop-Location
  throw "wrangler.toml not found in $WorkerPath"
}

$accountEnvName = "CLOUDFLARE_ACCOUNT_ID" 
# Assuming single account for now, or use the param if needed. 
# The original script had confusing logic for owner/client account IDs.
# Let's simplify and ust let wrangler handle auth or use a generic env var if set.

$argsList = @("wrangler", "deploy")

# Environment handling - standard wrangler environments are usually defined in toml
# But here we are passing it as a flag.
if ($Environment) {
    $argsList += @("--env", $Environment)
}

Write-Host "Deploying worker with: npx $($argsList -join ' ')"

# Use 'cmd /c' to ensure npx runs correctly in PowerShell context if needed, or just invoke directly
# 'npx' is a batch file on Windows usually.
& npx.cmd $argsList

Pop-Location
