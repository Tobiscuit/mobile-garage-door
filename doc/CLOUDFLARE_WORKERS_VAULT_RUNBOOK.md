# Cloudflare Workers + Terraform + Vault Runbook

## Purpose

This document is the operational guide for:

- Deploying the realtime proxy Worker to Cloudflare (`owner` and `client` accounts)
- Managing infrastructure with Terraform
- Managing Worker secrets safely
- Designing self-hosted HashiCorp Vault for multiple projects

---

## Current Repository Components

### Worker runtime

- `workers/realtime-proxy/src/index.ts`

### Wrangler config

- `wrangler.toml`

### Deploy and secret scripts

- `scripts/deploy-worker.ps1`
- `scripts/set-worker-secrets.ps1`

### Terraform for Workers

- `terraform/workers/providers.tf`
- `terraform/workers/variables.tf`
- `terraform/workers/main.tf`
- `terraform/workers/outputs.tf`
- `terraform/workers/owner.tfvars.example`
- `terraform/workers/client.tfvars.example`

### NPM commands

- `npm run worker:deploy:owner`
- `npm run worker:deploy:client`
- `npm run worker:secrets:owner`
- `npm run worker:secrets:client`

---

## Architecture

1. Client connects to your Cloudflare Worker endpoint via WebSocket.
2. Worker upgrades request (`101`) and opens upstream WebSocket to Gemini Live API.
3. Worker relays messages bidirectionally (client <-> Gemini).
4. Terraform manages Cloudflare routes and optional KV namespace.
5. Wrangler deploys Worker code and sets secrets per environment.

---

## Why this setup

- Same source repo for all environments/accounts.
- Account switching is configuration-only, not code migration.
- Terraform handles durable infrastructure.
- Wrangler handles code + secret injection.
- Works with manual deploy, CI deploy, or Git integration.

---

## Prerequisites

- Cloudflare account(s) with Worker access
- Cloudflare API token(s) with required permissions:
  - Workers Scripts
  - Workers Routes
  - Workers KV (if used)
  - Zone read/edit for route attachment
- Account ID and Zone ID for each target account
- Terraform installed
- Node.js + npm installed
- Wrangler available (`npx wrangler ...` is sufficient)

---

## Environment Model

- `owner` = your account deployment target
- `client` = client account deployment target

Script naming model:

- `mobile-garage-door-realtime-proxy-owner`
- `mobile-garage-door-realtime-proxy-client`

---

## Bootstrap Steps (Owner)

1. Prepare tfvars

```powershell
cd terraform/workers
Copy-Item .\owner.tfvars.example .\owner.tfvars
```

2. Fill `owner.tfvars` values

- `cloudflare_api_token`
- `cloudflare_account_id`
- `cloudflare_zone_id`
- `routes`

3. Apply infra

```powershell
terraform init
terraform plan -var-file=owner.tfvars
terraform apply -var-file=owner.tfvars
```

4. Set account environment variable for deploy scripts

```powershell
$env:CLOUDFLARE_ACCOUNT_ID_OWNER = "<owner-account-id>"
```

5. Set Worker secrets

```powershell
cd ../..
npm run worker:secrets:owner
```

6. Deploy code

```powershell
npm run worker:deploy:owner
```

---

## Bootstrap Steps (Client)

1. Prepare tfvars

```powershell
cd terraform/workers
Copy-Item .\client.tfvars.example .\client.tfvars
```

2. Fill `client.tfvars` values

- `cloudflare_api_token`
- `cloudflare_account_id`
- `cloudflare_zone_id`
- `routes`

3. Apply infra

```powershell
terraform init
terraform plan -var-file=client.tfvars
terraform apply -var-file=client.tfvars
```

4. Set account environment variable for deploy scripts

```powershell
$env:CLOUDFLARE_ACCOUNT_ID_CLIENT = "<client-account-id>"
```

5. Set Worker secrets

```powershell
cd ../..
npm run worker:secrets:client
```

6. Deploy code

```powershell
npm run worker:deploy:client
```

---

## Migration: Owner -> Client Account

1. Apply `client` Terraform stack.
2. Set `client` Worker secrets.
3. Deploy `client` Worker.
4. Validate endpoint and auth behavior.
5. Cut traffic by switching DNS/route to client endpoint.
6. Keep owner deployment as fallback until stable.

No source-code move is required.

---

## Git Integration vs Wrangler CLI

You can do either:

1. Cloudflare Git integration (Workers Builds)
- Connect GitHub/GitLab repo in Cloudflare dashboard.
- Auto deploy from selected branches.

2. External CI (recommended for explicit control)
- Use GitHub Actions + `cloudflare/wrangler-action`.
- This repo includes `.github/workflows/deploy-worker.yml`.

3. Local/ops deploy
- Use `npm run worker:deploy:*` scripts.

Key point: code remains in your repo in all cases.

---

## Secret Management Baseline (without Vault)

Current flow:

1. `scripts/set-worker-secrets.ps1` runs `wrangler secret put`.
2. Secrets are entered interactively per environment/account.
3. Secrets are stored by Cloudflare, scoped to each Worker environment.

This is acceptable for early stage, but scales poorly across teams/projects.

---

## HashiCorp Vault Self-Hosted: Benefits

Self-hosted Vault is useful when you need stronger control and auditability than scattered CI/CD secrets.

### Core benefits

1. Centralized secret source of truth
- One system to manage API keys, tokens, certs, credentials.

2. Strong access control
- Policy-based, least-privilege access per team/project/environment.

3. Full audit trail
- Detailed logs of who accessed which secret and when.

4. Secret rotation workflows
- Easier rotation playbooks and reduced blast radius.

5. Short-lived credentials (where supported)
- Prefer ephemeral credentials over static shared tokens.

6. Operational consistency
- Same secret patterns for all projects, reducing human error.

---

## Can one Vault support multiple projects?

Yes. This is a common and recommended pattern.

You can run one Vault cluster and isolate projects by path, policy, and auth roles.

---

## Multi-project Vault Design (Practical)

### Option A: OSS Vault (path-based isolation)

- Use KV v2 paths per project/environment:
  - `kv/data/mobile-garage-door/owner/*`
  - `kv/data/mobile-garage-door/client/*`
  - `kv/data/another-project/prod/*`
- Create separate policies per project and per deployment identity.
- Bind each CI identity/token to only its allowed paths.

### Option B: Vault Enterprise (namespaces)

- Use top-level namespace per client or business unit.
- Keep the same path structure within each namespace.
- Strong tenant isolation at scale.

---

## Recommended Secret Path Convention

Use stable naming:

- `kv/data/<project>/<env>/cloudflare/api_token`
- `kv/data/<project>/<env>/gemini/api_key`
- `kv/data/<project>/<env>/app/allowed_origin`

Example:

- `kv/data/mobile-garage-door/owner/gemini/api_key`
- `kv/data/mobile-garage-door/client/gemini/api_key`

---

## Recommended Policy Pattern

Per environment, create a narrow policy. Example intent:

- CI role for `mobile-garage-door-owner` can read only:
  - `kv/data/mobile-garage-door/owner/*`
- CI role for `mobile-garage-door-client` can read only:
  - `kv/data/mobile-garage-door/client/*`

No broad wildcard grants across all projects.

---

## Vault + Cloudflare Deployment Flow

1. CI authenticates to Vault (OIDC/JWT/AppRole).
2. CI reads environment-specific secrets.
3. CI executes `wrangler secret put` for target environment.
4. CI runs `wrangler deploy --env <target>`.

Result: Cloudflare remains runtime secret store, Vault remains source of truth.

---

## Example Rollout Plan for Vault Adoption

1. Phase 1: Manual baseline
- Continue current `wrangler secret put` process.

2. Phase 2: Introduce Vault for one environment
- Store owner secrets in Vault.
- Update CI to read owner secrets from Vault and deploy.

3. Phase 3: Add client + additional projects
- Duplicate policy/path pattern.
- Add separate CI identities.

4. Phase 4: Rotation + audit hardening
- Schedule key rotation.
- Add alerting on sensitive secret reads.

---

## Operational Guardrails

- Never commit real tokens in `.tfvars` or repo files.
- Keep `.tfvars` local and gitignored.
- Use separate Cloudflare API tokens for owner/client.
- Use least-privilege policies in both Cloudflare and Vault.
- Treat all deploy identities as environment-scoped, not global.

---

## Troubleshooting Checklist

1. Worker deploy fails:
- Verify account ID env var (`CLOUDFLARE_ACCOUNT_ID_OWNER/CLIENT`)
- Verify API token permissions
- Verify `wrangler.toml` environment name

2. Route not serving Worker:
- Confirm Terraform applied successfully
- Confirm route pattern in `routes`
- Confirm zone ID is correct for that domain

3. Upstream Gemini connection fails:
- Re-enter `GEMINI_API_KEY`
- Validate outbound WebSocket support and endpoint
- Check Worker logs for close/error events

4. Client migration mismatch:
- Ensure client routes and secrets are set before cutover
- Confirm CI is using client credentials, not owner credentials

---

## References

- Cloudflare Workers WebSockets examples:
  - https://developers.cloudflare.com/workers/examples/websockets
- Cloudflare Workers Git integration:
  - https://developers.cloudflare.com/workers/ci-cd/builds/git-integration
- Cloudflare Wrangler Action:
  - https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions
- Terraform Cloudflare Workers route resource:
  - https://github.com/cloudflare/terraform-provider-cloudflare/blob/main/docs/resources/workers_route.md
- Terraform Cloudflare Workers KV namespace resource:
  - https://github.com/cloudflare/terraform-provider-cloudflare/blob/main/docs/resources/workers_kv_namespace.md
