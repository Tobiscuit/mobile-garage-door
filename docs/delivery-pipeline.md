# Delivery pipeline

How this Worker gets built, previewed, and deployed.

> **Do not merge this change before the Cloudflare Access policy exists.**
> Enabling `preview_urls` publishes every uploaded version at a public
> `*.workers.dev` URL. The policy in
> [What only the account owner can do](#what-only-the-account-owner-can-do) must
> be in place first, or this site becomes reachable at a URL nobody is watching.

> **A preview version uses PRODUCTION data.** See
> [What a preview is and is not](#what-a-preview-is-and-is-not) before reviewing
> anything on a preview URL. This matters more here than on the other sites,
> because this app carries authentication and payments.

## Why the GitHub Actions deploy was removed

`.github/workflows/deploy-worker.yml` is deleted, not repaired. It was broken in
three independent ways, each confirmed against this repository rather than
assumed:

1. **No install and no build step.** Its only steps were `actions/checkout` and
   `actions/setup-node`, then `cloudflare/wrangler-action` with
   `command: deploy --env owner`. Nothing ever ran `npm ci` or a build, so there
   was no compiled output to deploy.
2. **It targeted environments that do not exist.** It deployed `--env owner` and
   `--env client`, but `wrangler.jsonc` contains no `env` blocks whatsoever, and
   never has. The generated deploy config confirms this independently with
   `"definedEnvironments": []`.
3. **Without a build, the entry point cannot resolve.** Under vinext 1.0 the
   Worker entry is the bare specifier `vinext/server/fetch-handler`. Running
   Wrangler against a tree that has not been built fails outright:

   ```
   ✘ [ERROR] The entry-point file at "vinext/server/fetch-handler" was not found.
     This might mean that your entry-point file needs to be generated (which is
     the general case when a framework is being used).
   ```

   Since the workflow never built anything, this is exactly what it would hit.

**Every recorded run of that workflow failed** — 20 runs between 2026-02-28 and
2026-04-10, without a single success. Deleting it removes a permanently red
pipeline, not a working one.

## How the build and deploy configs relate

vinext builds through `@cloudflare/vite-plugin`, which reads the root
`wrangler.jsonc`, flattens it through Wrangler's own configuration schema, and
writes the result to `dist/server/wrangler.json`. It also writes a redirect file:

```json
// .wrangler/deploy/config.json   (a build artifact — gitignored)
{ "configPath": "../../dist/server/wrangler.json", "auxiliaryWorkers": [] }
```

Wrangler checks for that redirect on `deploy`, `dev`, and version-management
commands, and announces it:

```
Using redirected Wrangler configuration.
 - Configuration being used: "dist/server/wrangler.json"
 - Deploy configuration file: ".wrangler/deploy/config.json"
 - Original user's configuration: "wrangler.jsonc"
```

**`wrangler.jsonc` remains the only file you edit.** Changes there flow into the
generated config on the next build.

### Why the deploy commands name the config explicitly

Cloudflare's own Workers Builds documentation uses a bare `npx wrangler deploy`.
That works here *only* when a build has already run in the same tree, because the
redirect file is a build artifact. Measured on this project, all three states:

| Tree state | Command | Result |
| --- | --- | --- |
| After a build | `wrangler versions upload` | Works, redirects to the generated config |
| No redirect file | `wrangler versions upload` | **Fails** — entry-point specifier not found |
| No redirect file | `wrangler versions upload -c dist/server/wrangler.json` | Works |

Inside Workers Builds the build command runs before the deploy command, so the
bare form would normally work. It is nonetheless implicit: if the build is
skipped, cached, or fails partway, the deploy silently falls back to the root
config and dies with an error about a module specifier that reads like a code
bug rather than a pipeline bug. **The explicit `-c` form works in both states**,
so it is what the triggers below use.

## Workers Builds triggers

A Worker supports at most two triggers: one production, one preview. Configure
them in the Cloudflare dashboard, or via the API below.

| | Production | Preview |
| --- | --- | --- |
| Branches | `main` | everything except `main` |
| Build command | `npm run build` | `npm run build` |
| Deploy command | `npx wrangler deploy -c dist/server/wrangler.json` | `npx wrangler versions upload -c dist/server/wrangler.json` |
| Result | Live on mobilgaragedoor.com | A version + preview URL, not promoted |
| Root directory | `/` | `/` |

`wrangler versions upload` is the documented default for non-production branches.
It uploads a version **without** promoting it to production, which is what makes
a preview safe to open while the live site keeps serving the current version.

```bash
# Production trigger
curl -s "https://api.cloudflare.com/client/v4/accounts/{account_id}/builds/triggers" \
  --header "Authorization: Bearer <API_TOKEN>" \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{
    "external_script_id": "<WORKER_TAG>",
    "repo_connection_uuid": "<REPO_CONNECTION_UUID>",
    "build_token_uuid": "<BUILD_TOKEN_UUID>",
    "trigger_name": "Deploy production",
    "build_command": "npm run build",
    "deploy_command": "npx wrangler deploy -c dist/server/wrangler.json",
    "root_directory": "/",
    "branch_includes": ["main"],
    "branch_excludes": [],
    "path_includes": ["*"],
    "path_excludes": []
  }'

# Preview trigger
curl -s "https://api.cloudflare.com/client/v4/accounts/{account_id}/builds/triggers" \
  --header "Authorization: Bearer <API_TOKEN>" \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{
    "external_script_id": "<WORKER_TAG>",
    "repo_connection_uuid": "<REPO_CONNECTION_UUID>",
    "build_token_uuid": "<BUILD_TOKEN_UUID>",
    "trigger_name": "Deploy preview branches",
    "build_command": "npm run build",
    "deploy_command": "npx wrangler versions upload -c dist/server/wrangler.json",
    "root_directory": "/",
    "branch_includes": ["*"],
    "branch_excludes": ["main"],
    "path_includes": ["*"],
    "path_excludes": []
  }'
```

## What a preview is and is not

A preview version is a version of **this same Worker**. It is isolated in code,
not in data. Every binding resolves to the same production resource the live site
uses — confirmed by dry run against this project:

```
env.VINEXT_CACHE (14e1c4a34c4f4246b4455b28d72b6231)   KV Namespace
env.TRACKING_KV  (f0fcc9d39cc9422ea2c932fa968dc6a9)   KV Namespace
env.DB           (mobile-garage-door-db)              D1 Database
env.MEDIA_BUCKET (mobile-garage-door-media)           R2 Bucket
env.IMAGES                                            Images
```

So a preview URL is:

- **Safe** for reviewing rendering, layout, navigation, and read-only paths.
- **Unsafe** for writes. A form submission, an admin action, or a seed script run
  against a preview writes to the real `mobile-garage-door-db` and the real
  `MEDIA_BUCKET`, and is indistinguishable from production traffic afterwards.
- **Unsafe** for anything touching payments. This app integrates Square; a
  preview exercising a payment path is a real payment path.
- **Never** the place to test a database migration. Migrations apply to the one
  real D1 database regardless of which version is running.

If genuine data isolation is needed later, that is a separate piece of work —
a second Worker with its own bindings — and it was deliberately not built here.

## Preview URLs

`preview_urls: true` is now set in `wrangler.jsonc`. Previously the key was unset
and the Worker ran on defaults, which is weaker than it sounds: preview URLs
follow `workers_dev` unless set explicitly, and that was unset too. Declaring it
makes the intent reviewable instead of inherited.

Two kinds exist, and both matter here:

- **Versioned preview URLs** — generated automatically for every uploaded
  version. This is what the preview trigger produces on each push.
- **Aliased preview URLs** — a stable, readable hostname of the form
  `<ALIAS>-<WORKER_NAME>.<SUBDOMAIN>.workers.dev`, assigned at upload:

  ```bash
  npx wrangler versions upload -c dist/server/wrangler.json --preview-alias staging
  ```

  Use this when a link must stay valid across several pushes, such as sending the
  client one URL to review.

## Promotion flow

```
feature branch ──PR──▶ develop ──promotion PR──▶ main
      │                   │                       │
      │                   │                       └─ production deploy
      │                   └─ preview version + preview URL
      └─ CI (verify) + preview version
```

1. Open a PR against `develop`. CI runs, and the preview trigger uploads a
   version you can open at its preview URL.
2. Review the change at that URL, behind Access, within the limits in
   [What a preview is and is not](#what-a-preview-is-and-is-not).
3. When `develop` is good, open a promotion PR `develop` → `main`. Merging it
   runs the production trigger and goes live.

## What only the account owner can do

None of the following can be done from this repository. They require the
Cloudflare account that owns this Worker.

1. **Connect the repository to Workers Builds** — Cloudflare dashboard →
   Workers & Pages → this Worker → Settings → Builds → connect the GitHub repo.
   This produces the `repo_connection_uuid` and `build_token_uuid` used above.
2. **Create the Access policy protecting preview URLs.** Preview URLs are public
   by default. Create a self-hosted Access application whose destination is the
   **preview** Worker, and attach a policy limiting it to you:

   ```json
   {
     "name": "mobile-garage-door previews",
     "type": "self_hosted",
     "destinations": [
       { "type": "preview_worker", "worker_id": "<WORKER_ID>" }
     ],
     "session_duration": "24h"
   }
   ```

   > **Use `preview_worker` and nothing else.** The `worker` destination type
   > secures *all* requests routed to that Worker — which would put an Access
   > login screen in front of mobilgaragedoor.com for actual customers. Only
   > `preview_worker` scopes protection to preview deployments. Account-wide
   > `all_workers` / `all_preview_workers` destinations also exist, limited to
   > one of each per account; a specific `preview_worker` destination takes
   > precedence over them.
3. **Revoke the old GitHub secrets.** `CF_API_TOKEN_OWNER`, `CF_ACCOUNT_ID_OWNER`,
   `CF_API_TOKEN_CLIENT` and `CF_ACCOUNT_ID_CLIENT` existed only for the deleted
   workflow. Workers Builds authenticates through its own connection, so these
   are now unused and should be deleted from the repository's secrets and revoked
   in Cloudflare.

## Follow-ups, deliberately not done here

- **Add `develop` to the CI workflow triggers.** `.github/workflows/ci.yml`
  arrives in the dependency-upgrade PR and is deliberately untouched here to
  avoid a merge conflict. Once both have landed, its `push` trigger should
  include `develop`.
- **The Vercel integration is still attached to this repository.** It posts a
  failing check on every pull request, including ones it has nothing to do with.
  `vercel.json` declares `"framework": "nextjs"` with `"outputDirectory": ".next"`,
  which this app no longer produces — it is a Worker now. Disconnecting the
  integration (and deleting `vercel.json`) would remove a permanently red check.
- **Two other Workers live in this repository** and are not covered by the
  triggers above: `workers/seo-engine/wrangler.jsonc` (`seo-engine`) and
  `workers/realtime-proxy/wrangler.toml` (`mobile-garage-door-realtime-proxy`).
  Each Worker gets its own Workers Builds connection, so each needs its own
  triggers with the appropriate `root_directory` if they are to be deployed
  automatically.
