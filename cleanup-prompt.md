Please execute Phase 1 and Phase 2 of your proposed audit remediation. 

**CRITICAL RULES FOR THIS CLEANUP:**
1. **Privacy Risk (Highest Priority):** We have SQL dumps (`supabase_data.sql`, `d1_migration.sql`, etc.) in the root that contain real customer/admin data. 
   - You MUST create `.local-data/`
   - You MUST add `.local-data/` to `.gitignore` FIRST before moving files into it, so they are never accidentally tracked.
   - Move all `.sql`, `.db`, `.log`, and CLI output `.txt` files from the root into `.local-data/`.
2. **Move Artifacts:** Move `customer-portal-debug.png`, `localhost_*.png`, and `translate-pages-prompt.md` to `docs/archive/`.
3. **Scripts Cleanup:** Move any ad-hoc script files (`clean-users.ts`, `fix-auth-roles.mjs`, etc.) into the existing `scripts/` directory. 
   - **DO NOT** move root configuration files like `next.config.mjs`, `postcss.config.mjs`, `drizzle.config.ts`, `vitest.config.ts`, or anything that configures the build/framework. Only move actual execution scripts.
4. **Documentation Merge:** Merge the `doc/` folder into `docs/`. Ensure no content is lost.
5. **Leave Worker Directories Alone:** The `worker/` directory contains the main application server worker, and the `workers/` directory contains your other microservices (realtime-proxy and seo-engine). DO NOT merge or delete these.

Please execute these changes carefully and confirm once completed.
