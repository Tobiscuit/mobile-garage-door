# ADR 001: Standard vs. Standalone Next.js Build for Payload CMS

## Status
Accepted

## Context
Next.js offers two output modes:
1.  **Standard** (`output: undefined`): The default mode. Produces a `.next` directory requiring `node_modules`. robust but larger image size.
2.  **Standalone** (`output: 'standalone'`): optimises bundle size by tracing dependencies and creating a minimal `server.js`.

We deployed the application using Coolify (Nixpacks).
*   **Attempt 1 (Standalone)**: Resulted in a working frontend but a broken Payload Admin Panel (`/admin`).
    *   **Root Cause**: Payload CMS relies on specific static assets (admin UI bundles) and configuration files (`payload.config.ts`, `payload-types.ts`) that Next.js's dependency tracer does not automatically include in the standalone output folder.
    *   **Symptom**: 404 errors for Admin Panel CSS/JS files.

## Decision
We have decided to use the **Standard Next.js Build** for the immediate term.

## Consequences
*   **Positive**:
    *   Guaranteed compatibility with Payload CMS Admin Panel without custom build scripting.
    *   Simpler deployment pipeline (standard `npm start` / `next start`).
    *   Immediate resolution of the "Blank Admin Screen" issue.
*   **Negative**:
    *   Larger Docker image size (approx. 200MB - 500MB larger depending on usage).
    *   Slightly slower cold boot times compared to standalone.

## Future Mitigation
If Docker image size becomes a critical constraint, we can revert to Standalone mode by implementing a custom `Dockerfile` that explicitly copies the missing assets:
```dockerfile
# Example mitigation for future reference
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./
```
For now, the complexity of maintaining this custom Dockerfile outweighs the storage savings.
