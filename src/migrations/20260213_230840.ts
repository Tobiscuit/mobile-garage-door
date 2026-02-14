import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1. Enums (Safe creation via check)
  
  // Helper to check if type exists before creating
  // We use this to avoid "duplicate object" errors without swallowing real errors
  const createEnum = async (name: string, query: any) => {
    // Check if type exists
    const check = await db.execute(sql`SELECT 1 FROM pg_type WHERE typname = ${name};`)
    // If no rows, create it
    if (check.rows && check.rows.length === 0) {
      await db.execute(query)
    }
  }

  await createEnum('enum_users_role', sql`CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'technician', 'dispatcher', 'customer');`)
  await createEnum('enum_services_icon', sql`CREATE TYPE "public"."enum_services_icon" AS ENUM('lightning', 'building', 'clipboard', 'phone');`)
  await createEnum('enum_projects_image_style', sql`CREATE TYPE "public"."enum_projects_image_style" AS ENUM('garage-pattern-steel', 'garage-pattern-glass', 'garage-pattern-carriage', 'garage-pattern-modern');`)
  await createEnum('enum_posts_category', sql`CREATE TYPE "public"."enum_posts_category" AS ENUM('repair-tips', 'product-spotlight', 'contractor-insights', 'maintenance-guide', 'industry-news');`)
  await createEnum('enum_posts_status', sql`CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');`)
  await createEnum('enum_service_requests_urgency', sql`CREATE TYPE "public"."enum_service_requests_urgency" AS ENUM('standard', 'emergency');`)
  await createEnum('enum_service_requests_status', sql`CREATE TYPE "public"."enum_service_requests_status" AS ENUM('pending', 'confirmed', 'dispatched', 'on_site', 'completed', 'cancelled');`)

  // 2. Tables
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'admin' NOT NULL,
  	"name" varchar,
  	"phone" varchar,
  	"address" varchar,
  	"last_login" timestamp(3) with time zone,
  	"push_subscription" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );

  CREATE TABLE IF NOT EXISTS "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE IF NOT EXISTS "services_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"category" varchar NOT NULL,
  	"price" numeric,
  	"description" varchar NOT NULL,
  	"icon" "enum_services_icon" NOT NULL,
  	"highlight" boolean DEFAULT false,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "projects_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "projects_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"client" varchar NOT NULL,
  	"location" varchar NOT NULL,
  	"completion_date" timestamp(3) with time zone,
  	"description" jsonb NOT NULL,
  	"challenge" jsonb NOT NULL,
  	"solution" jsonb NOT NULL,
  	"image_style" "enum_projects_image_style" NOT NULL,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"author" varchar NOT NULL,
  	"location" varchar NOT NULL,
  	"rating" numeric DEFAULT 5 NOT NULL,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "posts_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"excerpt" varchar,
  	"content" jsonb NOT NULL,
  	"featured_image_id" integer,
  	"category" "enum_posts_category" NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"status" "enum_posts_status" DEFAULT 'draft' NOT NULL,
  	"quick_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "customers_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "customers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"address" varchar,
  	"square_customer_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "service_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ticket_id" varchar,
  	"customer_id" integer NOT NULL,
  	"issue_description" varchar NOT NULL,
  	"urgency" "enum_service_requests_urgency" DEFAULT 'standard',
  	"scheduled_time" timestamp(3) with time zone,
  	"status" "enum_service_requests_status" DEFAULT 'pending',
  	"assigned_tech_id" integer,
  	"trip_fee_payment" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "invoices" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"square_invoice_id" varchar NOT NULL,
  	"order_id" varchar,
  	"amount" numeric NOT NULL,
  	"status" varchar,
  	"customer_id" integer,
  	"public_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"square_payment_id" varchar NOT NULL,
  	"amount" numeric NOT NULL,
  	"currency" varchar,
  	"status" varchar,
  	"source_type" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"services_id" integer,
  	"projects_id" integer,
  	"testimonials_id" integer,
  	"posts_id" integer,
  	"customers_id" integer,
  	"service_requests_id" integer,
  	"invoices_id" integer,
  	"payments_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"customers_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "site_settings_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "site_settings_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"company_name" varchar DEFAULT 'Mobil Garage Door Pros' NOT NULL,
  	"phone" varchar DEFAULT '832-419-1293' NOT NULL,
  	"email" varchar DEFAULT 'service@mobilgaragedoor.com' NOT NULL,
  	"license_number" varchar DEFAULT 'TX Registered & Bonded',
  	"insurance_amount" varchar DEFAULT '$2M Policy',
  	"bbb_rating" varchar DEFAULT 'A+',
  	"mission_statement" varchar DEFAULT 'To provide fast, honest, and expert garage door service to every homeowner and contractor in our community—ensuring no one is ever left stranded with a broken door.',
  	"brand_voice" varchar DEFAULT 'You are "Mobil Garage Door"—a trusted expert who speaks to contractors and homeowners alike.
  Your tone is:
  • Professional & Industrial: Use terms like "fabrication," "deployment," "specs," "security envelope."
  • Direct & Confident: No fluff. Short sentences.
  • Helpful but not eager: You are the expert they need.
  
  Guidelines:
  • Never use "Salesy" language (e.g., "Act now!", "Best price!").
  • Focus on Technical Specs and Long-term Value.
  • Authority: Cite specifics (e.g., "R-18 insulation" not "good insulation")
  • If asked about price: "Pricing varies by spec. Book a diagnostic for an exact quote."',
  	"brand_tone" varchar DEFAULT '• Professional but not corporate—think trusted trade publication, not marketing brochure
  • Helpful first, promotional second
  • Calm confidence—never desperate or salesy
  • Occasional dry humor is fine, but prioritize clarity',
  	"brand_avoid" varchar DEFAULT 'NEVER USE:
  • "Best in class", "world-class", "cutting-edge" (vague superlatives)
  • "Synergy", "leverage", "paradigm" (corporate jargon)
  • Exclamation points!!! (too salesy)
  • "Don''t wait!", "Act now!", "Limited time!" (pressure tactics)
  • Emojis 🚫
  • "We''re passionate about..." (cliché)
  • Guarantees we can''t back up specifically',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)

  // 3. Columns (Safe addition)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "enum_users_role" DEFAULT 'admin' NOT NULL;`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "push_subscription" jsonb;`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" varchar;`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" varchar;`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address" varchar;`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login" timestamp(3) with time zone;`)
  await db.execute(sql`ALTER TABLE "service_requests" ADD COLUMN IF NOT EXISTS "assigned_tech_id" integer;`)
  await db.execute(sql`ALTER TABLE "service_requests" ADD COLUMN IF NOT EXISTS "trip_fee_payment" jsonb;`)
  await db.execute(sql`ALTER TABLE "service_requests" ADD COLUMN IF NOT EXISTS "ticket_id" varchar;`)

  // 4. Constraints (Safe addition)
  // We check information_schema to see if the constraint already exists
  const addConstraint = async (name: string, query: any) => {
    const check = await db.execute(sql`
      SELECT 1 
      FROM information_schema.table_constraints 
      WHERE constraint_name = ${name};
    `)
    if (check.rows && check.rows.length === 0) {
      await db.execute(query)
    }
  }

  await addConstraint('users_sessions_parent_id_fk', sql`ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('services_features_parent_id_fk', sql`ALTER TABLE "services_features" ADD CONSTRAINT "services_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('projects_tags_parent_id_fk', sql`ALTER TABLE "projects_tags" ADD CONSTRAINT "projects_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('projects_stats_parent_id_fk', sql`ALTER TABLE "projects_stats" ADD CONSTRAINT "projects_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('projects_image_id_media_id_fk', sql`ALTER TABLE "projects" ADD CONSTRAINT "projects_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;`)
  await addConstraint('posts_keywords_parent_id_fk', sql`ALTER TABLE "posts_keywords" ADD CONSTRAINT "posts_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('posts_featured_image_id_media_id_fk', sql`ALTER TABLE "posts" ADD CONSTRAINT "posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;`)
  await addConstraint('customers_sessions_parent_id_fk', sql`ALTER TABLE "customers_sessions" ADD CONSTRAINT "customers_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('service_requests_customer_id_customers_id_fk', sql`ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;`)
  await addConstraint('service_requests_assigned_tech_id_users_id_fk', sql`ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_assigned_tech_id_users_id_fk" FOREIGN KEY ("assigned_tech_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;`)
  await addConstraint('invoices_customer_id_customers_id_fk', sql`ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;`)
  await addConstraint('payload_locked_documents_rels_parent_fk', sql`ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('payload_locked_documents_rels_users_fk', sql`ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('payload_locked_documents_rels_media_fk', sql`ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('payload_locked_documents_rels_services_fk', sql`ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('payload_locked_documents_rels_projects_fk', sql`ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('payload_locked_documents_rels_testimonials_fk', sql`ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('payload_locked_documents_rels_posts_fk', sql`ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('payload_locked_documents_rels_customers_fk', sql`ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('payload_locked_documents_rels_service_requests_fk', sql`ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_service_requests_fk" FOREIGN KEY ("service_requests_id") REFERENCES "public"."service_requests"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('payload_locked_documents_rels_invoices_fk', sql`ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_invoices_fk" FOREIGN KEY ("invoices_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('payload_locked_documents_rels_payments_fk', sql`ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payments_fk" FOREIGN KEY ("payments_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('payload_preferences_rels_parent_fk', sql`ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('payload_preferences_rels_users_fk', sql`ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('payload_preferences_rels_customers_fk', sql`ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('site_settings_stats_parent_id_fk', sql`ALTER TABLE "site_settings_stats" ADD CONSTRAINT "site_settings_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;`)
  await addConstraint('site_settings_values_parent_id_fk', sql`ALTER TABLE "site_settings_values" ADD CONSTRAINT "site_settings_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;`)

  // 5. Indexes (Safe addition)
  await db.execute(sql`
  CREATE INDEX IF NOT EXISTS "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX IF NOT EXISTS "services_features_order_idx" ON "services_features" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "services_features_parent_id_idx" ON "services_features" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "projects_tags_order_idx" ON "projects_tags" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "projects_tags_parent_id_idx" ON "projects_tags" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "projects_stats_order_idx" ON "projects_stats" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "projects_stats_parent_id_idx" ON "projects_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "projects_image_id_idx" ON "projects" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "posts_keywords_order_idx" ON "posts_keywords" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "posts_keywords_parent_id_idx" ON "posts_keywords" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "posts_featured_image_id_idx" ON "posts" USING btree ("featured_image_id");
  CREATE INDEX IF NOT EXISTS "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "customers_sessions_order_idx" ON "customers_sessions" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "customers_sessions_parent_id_idx" ON "customers_sessions" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "customers_updated_at_idx" ON "customers" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "customers_created_at_idx" ON "customers" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "customers_email_idx" ON "customers" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "service_requests_customer_id_idx" ON "service_requests" USING btree ("customer_id");
  CREATE INDEX IF NOT EXISTS "service_requests_assigned_tech_id_idx" ON "service_requests" USING btree ("assigned_tech_id");
  CREATE INDEX IF NOT EXISTS "service_requests_updated_at_idx" ON "service_requests" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "service_requests_created_at_idx" ON "service_requests" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "invoices_customer_id_idx" ON "invoices" USING btree ("customer_id");
  CREATE INDEX IF NOT EXISTS "invoices_updated_at_idx" ON "invoices" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "invoices_created_at_idx" ON "invoices" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payments_updated_at_idx" ON "payments" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payments_created_at_idx" ON "payments" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_customers_id_idx" ON "payload_locked_documents_rels" USING btree ("customers_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_service_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("service_requests_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_invoices_id_idx" ON "payload_locked_documents_rels" USING btree ("invoices_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_payments_id_idx" ON "payload_locked_documents_rels" USING btree ("payments_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX IF NOT EXISTS "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_customers_id_idx" ON "payload_preferences_rels" USING btree ("customers_id");
  CREATE INDEX IF NOT EXISTS "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "site_settings_stats_order_idx" ON "site_settings_stats" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "site_settings_stats_parent_id_idx" ON "site_settings_stats" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "site_settings_values_order_idx" ON "site_settings_values" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "site_settings_values_parent_id_idx" ON "site_settings_values" USING btree ("_parent_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Down migration left empty intentionally to prevent data loss in production
}
