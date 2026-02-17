import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_staff_invites_role" AS ENUM('technician', 'admin');
  CREATE TYPE "public"."enum_staff_invites_status" AS ENUM('pending', 'accepted', 'revoked');
  CREATE TYPE "public"."enum_email_threads_status" AS ENUM('open', 'closed', 'archived');
  CREATE TYPE "public"."enum_emails_direction" AS ENUM('inbound', 'outbound');
  CREATE TABLE "staff_invites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"role" "enum_staff_invites_role" DEFAULT 'technician' NOT NULL,
  	"first_name" varchar,
  	"last_name" varchar,
  	"status" "enum_staff_invites_status" DEFAULT 'pending' NOT NULL,
  	"accepted_at" timestamp(3) with time zone,
  	"invited_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "email_threads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"subject" varchar NOT NULL,
  	"status" "enum_email_threads_status" DEFAULT 'open' NOT NULL,
  	"last_message_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "email_threads_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "emails" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"subject" varchar,
  	"body" jsonb,
  	"body_raw" varchar,
  	"thread_id" integer NOT NULL,
  	"direction" "enum_emails_direction" NOT NULL,
  	"raw_metadata" jsonb,
  	"message_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "emails_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"warranty_enable_notifications" boolean DEFAULT false,
  	"warranty_notification_email_template" varchar DEFAULT 'Hi {{client}},
  
  Your garage door labor warranty is expiring soon! Book a free checkup now.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "projects" ADD COLUMN "install_date" timestamp(3) with time zone;
  ALTER TABLE "projects" ADD COLUMN "warranty_expiration" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "staff_invites_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "email_threads_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "emails_id" integer;
  ALTER TABLE "staff_invites" ADD CONSTRAINT "staff_invites_invited_by_id_users_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "email_threads_rels" ADD CONSTRAINT "email_threads_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."email_threads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "email_threads_rels" ADD CONSTRAINT "email_threads_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "emails" ADD CONSTRAINT "emails_thread_id_email_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."email_threads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "emails_rels" ADD CONSTRAINT "emails_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "emails_rels" ADD CONSTRAINT "emails_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "staff_invites_email_idx" ON "staff_invites" USING btree ("email");
  CREATE INDEX "staff_invites_invited_by_idx" ON "staff_invites" USING btree ("invited_by_id");
  CREATE INDEX "staff_invites_updated_at_idx" ON "staff_invites" USING btree ("updated_at");
  CREATE INDEX "staff_invites_created_at_idx" ON "staff_invites" USING btree ("created_at");
  CREATE INDEX "email_threads_subject_idx" ON "email_threads" USING btree ("subject");
  CREATE INDEX "email_threads_status_idx" ON "email_threads" USING btree ("status");
  CREATE INDEX "email_threads_updated_at_idx" ON "email_threads" USING btree ("updated_at");
  CREATE INDEX "email_threads_created_at_idx" ON "email_threads" USING btree ("created_at");
  CREATE INDEX "email_threads_rels_order_idx" ON "email_threads_rels" USING btree ("order");
  CREATE INDEX "email_threads_rels_parent_idx" ON "email_threads_rels" USING btree ("parent_id");
  CREATE INDEX "email_threads_rels_path_idx" ON "email_threads_rels" USING btree ("path");
  CREATE INDEX "email_threads_rels_users_id_idx" ON "email_threads_rels" USING btree ("users_id");
  CREATE INDEX "emails_from_idx" ON "emails" USING btree ("from");
  CREATE INDEX "emails_to_idx" ON "emails" USING btree ("to");
  CREATE INDEX "emails_subject_idx" ON "emails" USING btree ("subject");
  CREATE INDEX "emails_thread_idx" ON "emails" USING btree ("thread_id");
  CREATE INDEX "emails_direction_idx" ON "emails" USING btree ("direction");
  CREATE UNIQUE INDEX "emails_message_id_idx" ON "emails" USING btree ("message_id");
  CREATE INDEX "emails_updated_at_idx" ON "emails" USING btree ("updated_at");
  CREATE INDEX "emails_created_at_idx" ON "emails" USING btree ("created_at");
  CREATE INDEX "emails_rels_order_idx" ON "emails_rels" USING btree ("order");
  CREATE INDEX "emails_rels_parent_idx" ON "emails_rels" USING btree ("parent_id");
  CREATE INDEX "emails_rels_path_idx" ON "emails_rels" USING btree ("path");
  CREATE INDEX "emails_rels_media_id_idx" ON "emails_rels" USING btree ("media_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_staff_invites_fk" FOREIGN KEY ("staff_invites_id") REFERENCES "public"."staff_invites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_email_threads_fk" FOREIGN KEY ("email_threads_id") REFERENCES "public"."email_threads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_emails_fk" FOREIGN KEY ("emails_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_staff_invites_id_idx" ON "payload_locked_documents_rels" USING btree ("staff_invites_id");
  CREATE INDEX "payload_locked_documents_rels_email_threads_id_idx" ON "payload_locked_documents_rels" USING btree ("email_threads_id");
  CREATE INDEX "payload_locked_documents_rels_emails_id_idx" ON "payload_locked_documents_rels" USING btree ("emails_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "staff_invites" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "email_threads" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "email_threads_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "emails" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "emails_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "staff_invites" CASCADE;
  DROP TABLE "email_threads" CASCADE;
  DROP TABLE "email_threads_rels" CASCADE;
  DROP TABLE "emails" CASCADE;
  DROP TABLE "emails_rels" CASCADE;
  DROP TABLE "settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_staff_invites_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_email_threads_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_emails_fk";
  
  DROP INDEX "payload_locked_documents_rels_staff_invites_id_idx";
  DROP INDEX "payload_locked_documents_rels_email_threads_id_idx";
  DROP INDEX "payload_locked_documents_rels_emails_id_idx";
  ALTER TABLE "projects" DROP COLUMN "install_date";
  ALTER TABLE "projects" DROP COLUMN "warranty_expiration";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "staff_invites_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "email_threads_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "emails_id";
  DROP TYPE "public"."enum_staff_invites_role";
  DROP TYPE "public"."enum_staff_invites_status";
  DROP TYPE "public"."enum_email_threads_status";
  DROP TYPE "public"."enum_emails_direction";`)
}
