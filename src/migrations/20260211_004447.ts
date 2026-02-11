import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   -- Add price column to services if it doesn't exist
   ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "price" numeric;

   -- Add completion_date column to projects if it doesn't exist
   ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "completion_date" timestamp(3) with time zone;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" DROP COLUMN IF EXISTS "price";
   ALTER TABLE "projects" DROP COLUMN IF EXISTS "completion_date";
  `)
}
