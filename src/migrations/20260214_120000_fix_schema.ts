import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Helper to check if type exists before creating
  const createEnum = async (name: string, query: any) => {
    const check = await db.execute(sql`SELECT 1 FROM pg_type WHERE typname = ${name};`)
    if (check.rows && check.rows.length === 0) {
      await db.execute(query)
    }
  }

  // Ensure Enums exist
  await createEnum('enum_users_role', sql`CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'technician', 'dispatcher', 'customer');`)

  // Ensure Columns exist in "users"
  // We use IF NOT EXISTS to make this idempotent
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "enum_users_role" DEFAULT 'admin' NOT NULL;`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "push_subscription" jsonb;`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" varchar;`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" varchar;`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address" varchar;`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login" timestamp(3) with time zone;`)

  // Ensure Columns exist in "service_requests"
  await db.execute(sql`ALTER TABLE "service_requests" ADD COLUMN IF NOT EXISTS "assigned_tech_id" integer;`)
  await db.execute(sql`ALTER TABLE "service_requests" ADD COLUMN IF NOT EXISTS "trip_fee_payment" jsonb;`)
  await db.execute(sql`ALTER TABLE "service_requests" ADD COLUMN IF NOT EXISTS "ticket_id" varchar;`)

  // Helper to check constraints
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

  // Re-apply critical constraints
  await addConstraint('service_requests_assigned_tech_id_users_id_fk', sql`ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_assigned_tech_id_users_id_fk" FOREIGN KEY ("assigned_tech_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // No-op for safety. We don't want to accidentally drop columns if this is rolled back 
  // without careful consideration, as it might cause data loss.
}
