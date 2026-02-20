import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ALTER COLUMN "content" DROP NOT NULL;
  ALTER TABLE "posts" ADD COLUMN "html_content" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ALTER COLUMN "content" SET NOT NULL;
  ALTER TABLE "posts" DROP COLUMN "html_content";`)
}
