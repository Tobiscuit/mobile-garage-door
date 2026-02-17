# Cloudflare Workers Terraform

This stack manages account/zone-level Worker infrastructure per environment (`owner`, `client`) while Wrangler deploys code and secrets.

## What Terraform manages

- Worker routes (`cloudflare_workers_route`)
- Optional KV namespace (`cloudflare_workers_kv_namespace`)

## What Wrangler manages

- Worker code deploy
- Worker secrets (`GEMINI_API_KEY`, `ALLOWED_ORIGIN`, etc.)

## Quick Start

1. Copy one of the examples and fill in values:

```powershell
Copy-Item .\owner.tfvars.example .\owner.tfvars
Copy-Item .\client.tfvars.example .\client.tfvars
```

2. Apply infrastructure:

```powershell
cd terraform/workers
terraform init
terraform plan -var-file=owner.tfvars
terraform apply -var-file=owner.tfvars
```

3. Deploy Worker code from repo root:

```powershell
cd ../..
npm run worker:deploy:owner
npm run worker:secrets:owner
```

## Owner to Client migration flow

1. Apply client infra with `client.tfvars`.
2. Set client secrets with `npm run worker:secrets:client`.
3. Deploy the same repo using `npm run worker:deploy:client`.
4. Update DNS/routes to point traffic to the client endpoint.

No source-code move is required; only account credentials and environment config change.
