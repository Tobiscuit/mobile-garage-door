## Full Migration: Next.js + Payload CMS → Vinext + Drizzle + Cloudflare

**IMPORTANT — BEFORE YOU START:**
Use context7 to fetch the latest documentation for: vinext, better-auth, and drizzle-orm. Verify all API usage against the latest docs before writing code.

Install the Vinext Agent Skill for up-to-date migration instructions:
```
npx skills add cloudflare/vinext
```
Read and follow the skill file instructions. They contain the latest Vinext compatibility info.

**Base branch:** `migration/vinext` — work off this branch, NOT main.

---

### What This Is

A garage door service company app (Next.js 16 App Router, React 19, Tailwind CSS v4, TypeScript) currently running on Payload CMS with PostgreSQL. We are migrating to **Vinext** (Cloudflare's Next.js replacement on Vite) and replacing **Payload CMS** with **Drizzle ORM** + **Cloudflare D1**.

This is a destructive migration — rip out Payload CMS entirely. The `migration/vinext` branch is our sandbox.

---

### PART 1: Vinext Migration

1. Run `npx vinext init` to bootstrap the migration
2. Create `vite.config.ts` with the correct plugins:
```typescript
import { defineConfig } from "vite";
import vinext from "vinext";
import rsc from "@vitejs/plugin-rsc";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    vinext(),
    rsc({
      entries: {
        rsc: "virtual:vinext-rsc-entry",
        ssr: "virtual:vinext-app-ssr-entry",
        client: "virtual:vinext-app-browser-entry",
      },
    }),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
  ],
});
```

3. Update `package.json`:
   - Add `"type": "module"`
   - Scripts: `"dev": "vinext dev"`, `"build": "vinext build"`, `"start": "vinext start"`, `"deploy": "vinext deploy"`
   - Remove `next`, `eslint-config-next`
   - Keep `react`, `react-dom`, `tailwindcss`, `better-auth`, `square`, `@google/genai`, `motion`, `web-push`, `drizzle-orm`

4. Rename `postcss.config.js` → `postcss.config.cjs`

5. Create `wrangler.jsonc`:
```jsonc
{
  "name": "mobile-garage-door",
  "compatibility_date": "2026-02-01",
  "main": "worker/index.ts",
  "d1_databases": [
    { "binding": "DB", "database_name": "mobile-garage-door-db", "database_id": "placeholder" }
  ],
  "r2_buckets": [
    { "binding": "MEDIA_BUCKET", "bucket_name": "mobile-garage-door-media" }
  ],
  "kv_namespaces": [
    { "binding": "VINEXT_CACHE", "id": "placeholder" }
  ]
}
```

6. Create `worker/index.ts` with KV cache handler:
```typescript
import { KVCacheHandler } from "vinext/cloudflare";
import { setCacheHandler } from "next/cache";
import handler from "vinext/server/app-router-entry";

interface Env {
  VINEXT_CACHE: KVNamespace;
  ASSETS: Fetcher;
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    setCacheHandler(new KVCacheHandler(env.VINEXT_CACHE, {
      appPrefix: "mobile-garage-door",
    }));
    return handler.fetch(request);
  },
};
```

7. Vinext-specific changes:
   - Replace `next-intl` with `react-i18next` (Vinext doesn't have `next-intl` support). Keep locales: en, es, vi
   - Image optimization works via `@unpic/react` (auto-detects CDN). Remote images via R2 work. Local images go through `/_vinext/image` endpoint
   - Middleware fully works (same Next.js `middleware.ts` syntax)
   - Server Actions work

8. What does NOT work on Vinext (don't use these):
   - `@vercel/og` — use Cloudflare equivalent
   - `next/jest` — use Vitest
   - webpack/turbopack configs — use Vite plugins
   - AMP — deprecated

---

### PART 2: Replace Payload CMS with Drizzle ORM

**Delete all Payload CMS code:**
- Delete `src/payload.config.ts`
- Delete `src/payload-types.ts`
- Delete `src/collections/` directory
- Delete `src/globals/` directory
- Delete `src/migrations/` directory (all Payload migrations)
- Delete `src/app/(payload)/` directory (Payload admin UI routes)
- Delete `src/features/payload/` directory
- Remove ALL `@payloadcms/*` packages from `package.json`
- Remove `payload`, `payload-auth`, `graphql`, `pg` packages

**Create Drizzle ORM schema** at `db/schema.ts` for Cloudflare D1 (SQLite):

```typescript
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Auth tables (managed by Better Auth, but define for reference)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  image: text("image"),
  role: text("role", { enum: ["admin", "technician", "dispatcher", "customer"] }).default("customer"),
  customerType: text("customer_type", { enum: ["residential", "builder"] }).default("residential"),
  companyName: text("company_name"),
  phone: text("phone"),
  address: text("address"),
  lastLogin: text("last_login"),
  pushSubscription: text("push_subscription"), // JSON string
  squareCustomerId: text("square_customer_id"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// Better Auth tables: sessions, accounts, verifications, passkeys — let Better Auth create these

// Business tables
export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category"),
  price: text("price"),
  description: text("description"),
  icon: text("icon"),
  highlight: integer("highlight", { mode: "boolean" }).default(false),
  order: integer("order").default(0),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const serviceFeatures = sqliteTable("service_features", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serviceId: integer("service_id").references(() => services.id, { onDelete: "cascade" }),
  feature: text("feature").notNull(),
  order: integer("order").default(0),
});

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  client: text("client"),
  location: text("location"),
  completionDate: text("completion_date"),
  installDate: text("install_date"),
  warrantyExpiration: text("warranty_expiration"),
  description: text("description"),
  challenge: text("challenge"),
  solution: text("solution"),
  imageStyle: text("image_style"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const serviceRequests = sqliteTable("service_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticketId: text("ticket_id").notNull().unique(),
  customerId: text("customer_id").references(() => users.id),
  issueDescription: text("issue_description"),
  urgency: text("urgency", { enum: ["low", "medium", "high", "emergency"] }).default("medium"),
  scheduledTime: text("scheduled_time"),
  status: text("status", { enum: ["pending", "confirmed", "dispatched", "on_site", "completed", "cancelled"] }).default("pending"),
  assignedTechId: text("assigned_tech_id").references(() => users.id),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// Add remaining tables: posts, testimonials, invoices, payments, staff_invites,
// email_threads, emails, media — following the same pattern above.
// Refer to src/collections/ for exact field definitions before deleting them.
```

**Create Drizzle config** at `drizzle.config.ts`:
```typescript
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "sqlite",
});
```

**Create DB client** at `db/index.ts`:
```typescript
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDB(d1: D1Database) {
  return drizzle(d1, { schema });
}
```

---

### PART 3: Better Auth Standalone

Replace `payload-auth` with standalone Better Auth. Create `lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { passkey } from "@better-auth/passkey";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDB } from "../db";

export function createAuth(d1: D1Database) {
  const db = getDB(d1);
  return betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite" }),
    plugins: [passkey()],
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    emailAndPassword: { enabled: true },
    user: {
      additionalFields: {
        role: { type: "string", defaultValue: "customer" },
        customerType: { type: "string", defaultValue: "residential" },
      },
    },
  });
}
```

Update `lib/auth-client.ts` to use `better-auth/client` directly (no payload-auth wrapper).

---

### PART 4: Update All Payload-Dependent Code

Every file that imports from `payload`, `@payloadcms/*`, or `payload-auth` needs to be rewritten to use Drizzle queries instead. Key files:

- `src/services/*.ts` — rewrite all Payload `find()`, `create()`, `update()`, `delete()` calls to Drizzle `select()`, `insert()`, `update()`, `delete()` equivalents
- `src/app/actions/*.ts` — same treatment for server actions
- `src/features/admin/**` — rewrite admin panel CRUD to use Drizzle
- `src/features/portal/**` — rewrite customer portal data fetching
- `src/features/dashboard/**` — rewrite dashboard queries
- `src/app/api/**` — rewrite API route handlers
- `src/lib/payload.ts` — delete entirely, replace with `db/index.ts`

For each Payload query like:
```typescript
const result = await payload.find({ collection: 'services', where: { slug: { equals: 'repair' } } });
```
Replace with:
```typescript
const result = await db.select().from(services).where(eq(services.slug, 'repair'));
```

---

### What to Keep As-Is
- All React components and UI code (`src/features/landing/`, `src/features/booking/`, etc.)
- Tailwind CSS styles (`globals.css`)
- The "Techno-Hero" design aesthetic
- Square payment integration logic (just change data layer calls)
- Google GenAI integration (`src/lib/ai-contract.ts`)
- PWA manifest
- All public page content and structure

### Testing Checklist
- `vinext dev` starts without errors
- All pages render (landing, services, portfolio, blog, dashboard, admin)
- Auth flows work (login, signup, Google SSO, passkey)
- App Router navigation works client-side
- API routes respond correctly
- Tailwind styles render properly
