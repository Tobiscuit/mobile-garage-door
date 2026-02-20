import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" ADD COLUMN "html_description" varchar;
  ALTER TABLE "projects" ADD COLUMN "html_challenge" varchar;
  ALTER TABLE "projects" ADD COLUMN "html_solution" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DROP COLUMN "html_description";
  ALTER TABLE "projects" DROP COLUMN "html_challenge";
  ALTER TABLE "projects" DROP COLUMN "html_solution";`)
}
