


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."_locales" AS ENUM (
    'en',
    'es',
    'vi'
);


ALTER TYPE "public"."_locales" OWNER TO "postgres";


CREATE TYPE "public"."enum_email_threads_status" AS ENUM (
    'open',
    'closed',
    'archived'
);


ALTER TYPE "public"."enum_email_threads_status" OWNER TO "postgres";


CREATE TYPE "public"."enum_emails_direction" AS ENUM (
    'inbound',
    'outbound'
);


ALTER TYPE "public"."enum_emails_direction" OWNER TO "postgres";


CREATE TYPE "public"."enum_posts_category" AS ENUM (
    'repair-tips',
    'product-spotlight',
    'contractor-insights',
    'maintenance-guide',
    'industry-news'
);


ALTER TYPE "public"."enum_posts_category" OWNER TO "postgres";


CREATE TYPE "public"."enum_posts_status" AS ENUM (
    'draft',
    'published'
);


ALTER TYPE "public"."enum_posts_status" OWNER TO "postgres";


CREATE TYPE "public"."enum_projects_image_style" AS ENUM (
    'garage-pattern-steel',
    'garage-pattern-glass',
    'garage-pattern-carriage',
    'garage-pattern-modern'
);


ALTER TYPE "public"."enum_projects_image_style" OWNER TO "postgres";


CREATE TYPE "public"."enum_service_requests_status" AS ENUM (
    'pending',
    'confirmed',
    'dispatched',
    'on_site',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."enum_service_requests_status" OWNER TO "postgres";


CREATE TYPE "public"."enum_service_requests_urgency" AS ENUM (
    'standard',
    'emergency'
);


ALTER TYPE "public"."enum_service_requests_urgency" OWNER TO "postgres";


CREATE TYPE "public"."enum_services_icon" AS ENUM (
    'lightning',
    'building',
    'clipboard',
    'phone'
);


ALTER TYPE "public"."enum_services_icon" OWNER TO "postgres";


CREATE TYPE "public"."enum_settings_theme_preference" AS ENUM (
    'candlelight',
    'original'
);


ALTER TYPE "public"."enum_settings_theme_preference" OWNER TO "postgres";


CREATE TYPE "public"."enum_staff_invites_role" AS ENUM (
    'technician',
    'admin'
);


ALTER TYPE "public"."enum_staff_invites_role" OWNER TO "postgres";


CREATE TYPE "public"."enum_staff_invites_status" AS ENUM (
    'pending',
    'accepted',
    'revoked'
);


ALTER TYPE "public"."enum_staff_invites_status" OWNER TO "postgres";


CREATE TYPE "public"."enum_users_customer_type" AS ENUM (
    'residential',
    'builder'
);


ALTER TYPE "public"."enum_users_customer_type" OWNER TO "postgres";


CREATE TYPE "public"."enum_users_role" AS ENUM (
    'admin',
    'technician',
    'dispatcher',
    'customer'
);


ALTER TYPE "public"."enum_users_role" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."accounts" (
    "id" integer NOT NULL,
    "account_id" character varying NOT NULL,
    "provider_id" character varying NOT NULL,
    "user_id" integer NOT NULL,
    "access_token" character varying,
    "refresh_token" character varying,
    "id_token" character varying,
    "access_token_expires_at" timestamp(3) with time zone,
    "refresh_token_expires_at" timestamp(3) with time zone,
    "scope" character varying,
    "password" character varying,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."accounts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."accounts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."accounts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."accounts_id_seq" OWNED BY "public"."accounts"."id";



CREATE TABLE IF NOT EXISTS "public"."admin_invitations" (
    "id" integer NOT NULL,
    "role" character varying NOT NULL,
    "token" character varying NOT NULL,
    "url" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."admin_invitations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."admin_invitations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."admin_invitations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."admin_invitations_id_seq" OWNED BY "public"."admin_invitations"."id";



CREATE TABLE IF NOT EXISTS "public"."email_threads" (
    "id" integer NOT NULL,
    "subject" character varying NOT NULL,
    "status" "public"."enum_email_threads_status" DEFAULT 'open'::"public"."enum_email_threads_status" NOT NULL,
    "last_message_at" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."email_threads" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."email_threads_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."email_threads_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."email_threads_id_seq" OWNED BY "public"."email_threads"."id";



CREATE TABLE IF NOT EXISTS "public"."email_threads_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "users_id" integer
);


ALTER TABLE "public"."email_threads_rels" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."email_threads_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."email_threads_rels_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."email_threads_rels_id_seq" OWNED BY "public"."email_threads_rels"."id";



CREATE TABLE IF NOT EXISTS "public"."emails" (
    "id" integer NOT NULL,
    "from" character varying NOT NULL,
    "to" character varying NOT NULL,
    "subject" character varying,
    "body" "jsonb",
    "body_raw" character varying,
    "thread_id" integer NOT NULL,
    "direction" "public"."enum_emails_direction" NOT NULL,
    "raw_metadata" "jsonb",
    "message_id" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."emails" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."emails_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."emails_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."emails_id_seq" OWNED BY "public"."emails"."id";



CREATE TABLE IF NOT EXISTS "public"."emails_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "media_id" integer
);


ALTER TABLE "public"."emails_rels" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."emails_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."emails_rels_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."emails_rels_id_seq" OWNED BY "public"."emails_rels"."id";



CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" integer NOT NULL,
    "square_invoice_id" character varying NOT NULL,
    "order_id" character varying,
    "amount" numeric NOT NULL,
    "status" character varying,
    "customer_id" integer,
    "public_url" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."invoices_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."invoices_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."invoices_id_seq" OWNED BY "public"."invoices"."id";



CREATE TABLE IF NOT EXISTS "public"."media" (
    "id" integer NOT NULL,
    "alt" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "url" character varying,
    "thumbnail_u_r_l" character varying,
    "filename" character varying,
    "mime_type" character varying,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "focal_x" numeric,
    "focal_y" numeric
);


ALTER TABLE "public"."media" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."media_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."media_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."media_id_seq" OWNED BY "public"."media"."id";



CREATE TABLE IF NOT EXISTS "public"."passkeys" (
    "id" integer NOT NULL,
    "name" character varying,
    "public_key" "text" NOT NULL,
    "user_id" integer NOT NULL,
    "credential_id" character varying NOT NULL,
    "counter" integer NOT NULL,
    "device_type" character varying NOT NULL,
    "backed_up" boolean NOT NULL,
    "transports" character varying,
    "aaguid" character varying,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."passkeys" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."passkeys_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."passkeys_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."passkeys_id_seq" OWNED BY "public"."passkeys"."id";



CREATE TABLE IF NOT EXISTS "public"."payload_kv" (
    "id" integer NOT NULL,
    "key" character varying NOT NULL,
    "data" "jsonb" NOT NULL
);


ALTER TABLE "public"."payload_kv" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."payload_kv_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."payload_kv_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."payload_kv_id_seq" OWNED BY "public"."payload_kv"."id";



CREATE TABLE IF NOT EXISTS "public"."payload_locked_documents" (
    "id" integer NOT NULL,
    "global_slug" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."payload_locked_documents" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."payload_locked_documents_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."payload_locked_documents_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."payload_locked_documents_id_seq" OWNED BY "public"."payload_locked_documents"."id";



CREATE TABLE IF NOT EXISTS "public"."payload_locked_documents_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "users_id" integer,
    "media_id" integer,
    "services_id" integer,
    "projects_id" integer,
    "testimonials_id" integer,
    "posts_id" integer,
    "service_requests_id" integer,
    "invoices_id" integer,
    "payments_id" integer,
    "staff_invites_id" integer,
    "email_threads_id" integer,
    "emails_id" integer,
    "sessions_id" integer,
    "accounts_id" integer,
    "verifications_id" integer,
    "passkeys_id" integer,
    "admin_invitations_id" integer
);


ALTER TABLE "public"."payload_locked_documents_rels" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."payload_locked_documents_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."payload_locked_documents_rels_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."payload_locked_documents_rels_id_seq" OWNED BY "public"."payload_locked_documents_rels"."id";



CREATE TABLE IF NOT EXISTS "public"."payload_migrations" (
    "id" integer NOT NULL,
    "name" character varying,
    "batch" numeric,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."payload_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."payload_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."payload_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."payload_migrations_id_seq" OWNED BY "public"."payload_migrations"."id";



CREATE TABLE IF NOT EXISTS "public"."payload_preferences" (
    "id" integer NOT NULL,
    "key" character varying,
    "value" "jsonb",
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."payload_preferences" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."payload_preferences_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."payload_preferences_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."payload_preferences_id_seq" OWNED BY "public"."payload_preferences"."id";



CREATE TABLE IF NOT EXISTS "public"."payload_preferences_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "users_id" integer
);


ALTER TABLE "public"."payload_preferences_rels" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."payload_preferences_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."payload_preferences_rels_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."payload_preferences_rels_id_seq" OWNED BY "public"."payload_preferences_rels"."id";



CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" integer NOT NULL,
    "square_payment_id" character varying NOT NULL,
    "amount" numeric NOT NULL,
    "currency" character varying,
    "status" character varying,
    "source_type" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "note" character varying
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."payments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."payments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."payments_id_seq" OWNED BY "public"."payments"."id";



CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" integer NOT NULL,
    "slug" character varying NOT NULL,
    "featured_image_id" integer,
    "category" "public"."enum_posts_category" NOT NULL,
    "published_at" timestamp(3) with time zone,
    "status" "public"."enum_posts_status" DEFAULT 'draft'::"public"."enum_posts_status" NOT NULL,
    "quick_notes" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."posts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."posts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."posts_id_seq" OWNED BY "public"."posts"."id";



CREATE TABLE IF NOT EXISTS "public"."posts_keywords" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "keyword" character varying NOT NULL
);


ALTER TABLE "public"."posts_keywords" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts_locales" (
    "title" character varying NOT NULL,
    "excerpt" character varying,
    "content" "jsonb",
    "html_content" character varying,
    "id" integer NOT NULL,
    "_locale" "public"."_locales" NOT NULL,
    "_parent_id" integer NOT NULL
);


ALTER TABLE "public"."posts_locales" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."posts_locales_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."posts_locales_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."posts_locales_id_seq" OWNED BY "public"."posts_locales"."id";



CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" integer NOT NULL,
    "slug" character varying NOT NULL,
    "location" character varying NOT NULL,
    "image_style" "public"."enum_projects_image_style" NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "completion_date" timestamp(3) with time zone,
    "install_date" timestamp(3) with time zone,
    "warranty_expiration" timestamp(3) with time zone
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "image_id" integer NOT NULL,
    "caption" character varying
);


ALTER TABLE "public"."projects_gallery" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."projects_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."projects_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."projects_id_seq" OWNED BY "public"."projects"."id";



CREATE TABLE IF NOT EXISTS "public"."projects_locales" (
    "title" character varying NOT NULL,
    "client" character varying NOT NULL,
    "description" "jsonb" NOT NULL,
    "challenge" "jsonb" NOT NULL,
    "solution" "jsonb" NOT NULL,
    "html_description" character varying,
    "html_challenge" character varying,
    "html_solution" character varying,
    "id" integer NOT NULL,
    "_locale" "public"."_locales" NOT NULL,
    "_parent_id" integer NOT NULL
);


ALTER TABLE "public"."projects_locales" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."projects_locales_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."projects_locales_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."projects_locales_id_seq" OWNED BY "public"."projects_locales"."id";



CREATE TABLE IF NOT EXISTS "public"."projects_stats" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "label" character varying NOT NULL,
    "value" character varying NOT NULL,
    "_locale" "public"."_locales" DEFAULT 'en'::"public"."_locales" NOT NULL
);


ALTER TABLE "public"."projects_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects_tags" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "tag" character varying NOT NULL
);


ALTER TABLE "public"."projects_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_requests" (
    "id" integer NOT NULL,
    "ticket_id" character varying,
    "customer_id" integer NOT NULL,
    "issue_description" character varying NOT NULL,
    "urgency" "public"."enum_service_requests_urgency" DEFAULT 'standard'::"public"."enum_service_requests_urgency",
    "scheduled_time" timestamp(3) with time zone,
    "status" "public"."enum_service_requests_status" DEFAULT 'pending'::"public"."enum_service_requests_status",
    "trip_fee_payment" "jsonb",
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "assigned_tech_id" integer
);


ALTER TABLE "public"."service_requests" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."service_requests_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."service_requests_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."service_requests_id_seq" OWNED BY "public"."service_requests"."id";



CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" integer NOT NULL,
    "slug" character varying NOT NULL,
    "icon" "public"."enum_services_icon" NOT NULL,
    "highlight" boolean DEFAULT false,
    "order" numeric DEFAULT 0 NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "price" numeric
);


ALTER TABLE "public"."services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services_features" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "feature" character varying NOT NULL,
    "_locale" "public"."_locales" DEFAULT 'en'::"public"."_locales" NOT NULL
);


ALTER TABLE "public"."services_features" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."services_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."services_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."services_id_seq" OWNED BY "public"."services"."id";



CREATE TABLE IF NOT EXISTS "public"."services_locales" (
    "title" character varying NOT NULL,
    "category" character varying NOT NULL,
    "description" character varying NOT NULL,
    "id" integer NOT NULL,
    "_locale" "public"."_locales" NOT NULL,
    "_parent_id" integer NOT NULL
);


ALTER TABLE "public"."services_locales" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."services_locales_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."services_locales_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."services_locales_id_seq" OWNED BY "public"."services_locales"."id";



CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" integer NOT NULL,
    "expires_at" timestamp(3) with time zone NOT NULL,
    "token" character varying NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "ip_address" character varying,
    "user_agent" character varying,
    "user_id" integer NOT NULL
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."sessions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."sessions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."sessions_id_seq" OWNED BY "public"."sessions"."id";



CREATE TABLE IF NOT EXISTS "public"."settings" (
    "id" integer NOT NULL,
    "warranty_enable_notifications" boolean DEFAULT false,
    "warranty_notification_email_template" character varying DEFAULT 'Hi {{client}},
  
  Your garage door labor warranty is expiring soon! Book a free checkup now.'::character varying,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone,
    "company_name" character varying DEFAULT 'Mobil Garage Door Pros'::character varying NOT NULL,
    "phone" character varying DEFAULT '832-419-1293'::character varying NOT NULL,
    "email" character varying DEFAULT 'service@mobilgaragedoor.com'::character varying NOT NULL,
    "license_number" character varying DEFAULT 'TX Registered & Bonded'::character varying,
    "insurance_amount" character varying DEFAULT '$2M Policy'::character varying,
    "bbb_rating" character varying DEFAULT 'A+'::character varying,
    "mission_statement" character varying,
    "brand_voice" character varying,
    "brand_tone" character varying,
    "brand_avoid" character varying,
    "theme_preference" "public"."enum_settings_theme_preference" DEFAULT 'candlelight'::"public"."enum_settings_theme_preference"
);


ALTER TABLE "public"."settings" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."settings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."settings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."settings_id_seq" OWNED BY "public"."settings"."id";



CREATE TABLE IF NOT EXISTS "public"."settings_stats" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "value" character varying NOT NULL,
    "label" character varying NOT NULL
);


ALTER TABLE "public"."settings_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."settings_values" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "title" character varying NOT NULL,
    "description" character varying NOT NULL
);


ALTER TABLE "public"."settings_values" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_settings" (
    "id" integer NOT NULL,
    "company_name" character varying DEFAULT 'Mobil Garage Door Pros'::character varying NOT NULL,
    "phone" character varying DEFAULT '832-419-1293'::character varying NOT NULL,
    "email" character varying DEFAULT 'service@mobilgaragedoor.com'::character varying NOT NULL,
    "license_number" character varying DEFAULT 'TX Registered & Bonded'::character varying,
    "insurance_amount" character varying DEFAULT '$2M Policy'::character varying,
    "bbb_rating" character varying DEFAULT 'A+'::character varying,
    "mission_statement" character varying DEFAULT 'To provide fast, honest, and expert garage door service to every homeowner and contractor in our community—ensuring no one is ever left stranded with a broken door.'::character varying,
    "brand_voice" character varying DEFAULT 'You are "Mobil Garage Door"—a trusted expert who speaks to contractors and homeowners alike.
Your tone is:
• Professional & Industrial: Use terms like "fabrication," "deployment," "specs," "security envelope."
• Direct & Confident: No fluff. Short sentences.
• Helpful but not eager: You are the expert they need.

Guidelines:
• Never use "Salesy" language (e.g., "Act now!", "Best price!").
• Focus on Technical Specs and Long-term Value.
• Authority: Cite specifics (e.g., "R-18 insulation" not "good insulation")
• If asked about price: "Pricing varies by spec. Book a diagnostic for an exact quote."'::character varying,
    "brand_tone" character varying DEFAULT '• Professional but not corporate—think trusted trade publication, not marketing brochure
• Helpful first, promotional second
• Calm confidence—never desperate or salesy
• Occasional dry humor is fine, but prioritize clarity'::character varying,
    "brand_avoid" character varying DEFAULT 'NEVER USE:
• "Best in class", "world-class", "cutting-edge" (vague superlatives)
• "Synergy", "leverage", "paradigm" (corporate jargon)
• Exclamation points!!! (too salesy)
• "Don''t wait!", "Act now!", "Limited time!" (pressure tactics)
• Emojis 🚫
• "We''re passionate about..." (cliché)
• Guarantees we can''t back up specifically'::character varying,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
);


ALTER TABLE "public"."site_settings" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."site_settings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."site_settings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."site_settings_id_seq" OWNED BY "public"."site_settings"."id";



CREATE TABLE IF NOT EXISTS "public"."site_settings_stats" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "value" character varying NOT NULL,
    "label" character varying NOT NULL
);


ALTER TABLE "public"."site_settings_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_settings_values" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "title" character varying NOT NULL,
    "description" character varying NOT NULL
);


ALTER TABLE "public"."site_settings_values" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."staff_invites" (
    "id" integer NOT NULL,
    "email" character varying NOT NULL,
    "role" "public"."enum_staff_invites_role" DEFAULT 'technician'::"public"."enum_staff_invites_role" NOT NULL,
    "first_name" character varying,
    "last_name" character varying,
    "status" "public"."enum_staff_invites_status" DEFAULT 'pending'::"public"."enum_staff_invites_status" NOT NULL,
    "accepted_at" timestamp(3) with time zone,
    "invited_by_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."staff_invites" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."staff_invites_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."staff_invites_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."staff_invites_id_seq" OWNED BY "public"."staff_invites"."id";



CREATE TABLE IF NOT EXISTS "public"."testimonials" (
    "id" integer NOT NULL,
    "author" character varying NOT NULL,
    "rating" numeric DEFAULT 5 NOT NULL,
    "featured" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."testimonials" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."testimonials_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."testimonials_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."testimonials_id_seq" OWNED BY "public"."testimonials"."id";



CREATE TABLE IF NOT EXISTS "public"."testimonials_locales" (
    "quote" character varying NOT NULL,
    "location" character varying NOT NULL,
    "id" integer NOT NULL,
    "_locale" "public"."_locales" NOT NULL,
    "_parent_id" integer NOT NULL
);


ALTER TABLE "public"."testimonials_locales" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."testimonials_locales_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."testimonials_locales_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."testimonials_locales_id_seq" OWNED BY "public"."testimonials_locales"."id";



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" integer NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "email" character varying NOT NULL,
    "reset_password_token" character varying,
    "reset_password_expiration" timestamp(3) with time zone,
    "salt" character varying,
    "hash" character varying,
    "login_attempts" numeric DEFAULT 0,
    "lock_until" timestamp(3) with time zone,
    "role" "public"."enum_users_role" DEFAULT 'customer'::"public"."enum_users_role" NOT NULL,
    "push_subscription" "jsonb",
    "name" character varying,
    "phone" character varying,
    "address" character varying,
    "last_login" timestamp(3) with time zone,
    "square_customer_id" character varying,
    "customer_type" "public"."enum_users_customer_type" DEFAULT 'residential'::"public"."enum_users_customer_type",
    "company_name" character varying,
    "email_verified" boolean DEFAULT false NOT NULL,
    "image" character varying
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."users_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."users_id_seq" OWNED BY "public"."users"."id";



CREATE TABLE IF NOT EXISTS "public"."users_role" (
    "order" integer NOT NULL,
    "parent_id" integer NOT NULL,
    "value" character varying,
    "id" integer NOT NULL
);


ALTER TABLE "public"."users_role" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."users_role_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."users_role_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."users_role_id_seq" OWNED BY "public"."users_role"."id";



CREATE TABLE IF NOT EXISTS "public"."users_sessions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "created_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone NOT NULL
);


ALTER TABLE "public"."users_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."verifications" (
    "id" integer NOT NULL,
    "identifier" character varying NOT NULL,
    "value" character varying NOT NULL,
    "expires_at" timestamp(3) with time zone NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."verifications" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."verifications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."verifications_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."verifications_id_seq" OWNED BY "public"."verifications"."id";



ALTER TABLE ONLY "public"."accounts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."accounts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."admin_invitations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."admin_invitations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."email_threads" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."email_threads_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."email_threads_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."email_threads_rels_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."emails" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."emails_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."emails_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."emails_rels_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."invoices" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."invoices_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."media" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."media_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."passkeys" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."passkeys_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."payload_kv" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payload_kv_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."payload_locked_documents" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payload_locked_documents_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."payload_locked_documents_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payload_locked_documents_rels_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."payload_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payload_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."payload_preferences" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payload_preferences_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."payload_preferences_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payload_preferences_rels_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."payments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."posts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."posts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."posts_locales" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."posts_locales_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."projects" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."projects_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."projects_locales" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."projects_locales_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."service_requests" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."service_requests_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."services" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."services_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."services_locales" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."services_locales_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."sessions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."sessions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."settings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."settings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."site_settings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."site_settings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."staff_invites" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."staff_invites_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."testimonials" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."testimonials_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."testimonials_locales" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."testimonials_locales_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."users_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."users_role" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."users_role_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."verifications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."verifications_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_invitations"
    ADD CONSTRAINT "admin_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_threads"
    ADD CONSTRAINT "email_threads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_threads_rels"
    ADD CONSTRAINT "email_threads_rels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."emails"
    ADD CONSTRAINT "emails_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."emails_rels"
    ADD CONSTRAINT "emails_rels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media"
    ADD CONSTRAINT "media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."passkeys"
    ADD CONSTRAINT "passkeys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payload_kv"
    ADD CONSTRAINT "payload_kv_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payload_locked_documents"
    ADD CONSTRAINT "payload_locked_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payload_migrations"
    ADD CONSTRAINT "payload_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payload_preferences"
    ADD CONSTRAINT "payload_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payload_preferences_rels"
    ADD CONSTRAINT "payload_preferences_rels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts_keywords"
    ADD CONSTRAINT "posts_keywords_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts_locales"
    ADD CONSTRAINT "posts_locales_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects_gallery"
    ADD CONSTRAINT "projects_gallery_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects_locales"
    ADD CONSTRAINT "projects_locales_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects_stats"
    ADD CONSTRAINT "projects_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects_tags"
    ADD CONSTRAINT "projects_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_requests"
    ADD CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services_features"
    ADD CONSTRAINT "services_features_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services_locales"
    ADD CONSTRAINT "services_locales_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings_stats"
    ADD CONSTRAINT "settings_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings_values"
    ADD CONSTRAINT "settings_values_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_settings_stats"
    ADD CONSTRAINT "site_settings_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_settings_values"
    ADD CONSTRAINT "site_settings_values_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staff_invites"
    ADD CONSTRAINT "staff_invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."testimonials_locales"
    ADD CONSTRAINT "testimonials_locales_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."testimonials"
    ADD CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users_role"
    ADD CONSTRAINT "users_role_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users_sessions"
    ADD CONSTRAINT "users_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."verifications"
    ADD CONSTRAINT "verifications_pkey" PRIMARY KEY ("id");



CREATE INDEX "accounts_account_id_idx" ON "public"."accounts" USING "btree" ("account_id");



CREATE INDEX "accounts_created_at_idx" ON "public"."accounts" USING "btree" ("created_at");



CREATE INDEX "accounts_provider_id_idx" ON "public"."accounts" USING "btree" ("provider_id");



CREATE INDEX "accounts_updated_at_idx" ON "public"."accounts" USING "btree" ("updated_at");



CREATE INDEX "accounts_user_idx" ON "public"."accounts" USING "btree" ("user_id");



CREATE INDEX "admin_invitations_created_at_idx" ON "public"."admin_invitations" USING "btree" ("created_at");



CREATE INDEX "admin_invitations_updated_at_idx" ON "public"."admin_invitations" USING "btree" ("updated_at");



CREATE INDEX "email_threads_created_at_idx" ON "public"."email_threads" USING "btree" ("created_at");



CREATE INDEX "email_threads_rels_order_idx" ON "public"."email_threads_rels" USING "btree" ("order");



CREATE INDEX "email_threads_rels_parent_idx" ON "public"."email_threads_rels" USING "btree" ("parent_id");



CREATE INDEX "email_threads_rels_path_idx" ON "public"."email_threads_rels" USING "btree" ("path");



CREATE INDEX "email_threads_rels_users_id_idx" ON "public"."email_threads_rels" USING "btree" ("users_id");



CREATE INDEX "email_threads_status_idx" ON "public"."email_threads" USING "btree" ("status");



CREATE INDEX "email_threads_subject_idx" ON "public"."email_threads" USING "btree" ("subject");



CREATE INDEX "email_threads_updated_at_idx" ON "public"."email_threads" USING "btree" ("updated_at");



CREATE INDEX "emails_created_at_idx" ON "public"."emails" USING "btree" ("created_at");



CREATE INDEX "emails_direction_idx" ON "public"."emails" USING "btree" ("direction");



CREATE INDEX "emails_from_idx" ON "public"."emails" USING "btree" ("from");



CREATE UNIQUE INDEX "emails_message_id_idx" ON "public"."emails" USING "btree" ("message_id");



CREATE INDEX "emails_rels_media_id_idx" ON "public"."emails_rels" USING "btree" ("media_id");



CREATE INDEX "emails_rels_order_idx" ON "public"."emails_rels" USING "btree" ("order");



CREATE INDEX "emails_rels_parent_idx" ON "public"."emails_rels" USING "btree" ("parent_id");



CREATE INDEX "emails_rels_path_idx" ON "public"."emails_rels" USING "btree" ("path");



CREATE INDEX "emails_subject_idx" ON "public"."emails" USING "btree" ("subject");



CREATE INDEX "emails_thread_idx" ON "public"."emails" USING "btree" ("thread_id");



CREATE INDEX "emails_to_idx" ON "public"."emails" USING "btree" ("to");



CREATE INDEX "emails_updated_at_idx" ON "public"."emails" USING "btree" ("updated_at");



CREATE INDEX "invoices_created_at_idx" ON "public"."invoices" USING "btree" ("created_at");



CREATE INDEX "invoices_customer_idx" ON "public"."invoices" USING "btree" ("customer_id");



CREATE UNIQUE INDEX "invoices_square_invoice_id_idx" ON "public"."invoices" USING "btree" ("square_invoice_id");



CREATE INDEX "invoices_updated_at_idx" ON "public"."invoices" USING "btree" ("updated_at");



CREATE INDEX "media_created_at_idx" ON "public"."media" USING "btree" ("created_at");



CREATE UNIQUE INDEX "media_filename_idx" ON "public"."media" USING "btree" ("filename");



CREATE INDEX "media_updated_at_idx" ON "public"."media" USING "btree" ("updated_at");



CREATE INDEX "passkeys_created_at_idx" ON "public"."passkeys" USING "btree" ("created_at");



CREATE UNIQUE INDEX "passkeys_credential_id_idx" ON "public"."passkeys" USING "btree" ("credential_id");



CREATE INDEX "passkeys_updated_at_idx" ON "public"."passkeys" USING "btree" ("updated_at");



CREATE INDEX "passkeys_user_idx" ON "public"."passkeys" USING "btree" ("user_id");



CREATE UNIQUE INDEX "payload_kv_key_idx" ON "public"."payload_kv" USING "btree" ("key");



CREATE INDEX "payload_locked_documents_created_at_idx" ON "public"."payload_locked_documents" USING "btree" ("created_at");



CREATE INDEX "payload_locked_documents_global_slug_idx" ON "public"."payload_locked_documents" USING "btree" ("global_slug");



CREATE INDEX "payload_locked_documents_rels_accounts_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("accounts_id");



CREATE INDEX "payload_locked_documents_rels_admin_invitations_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("admin_invitations_id");



CREATE INDEX "payload_locked_documents_rels_email_threads_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("email_threads_id");



CREATE INDEX "payload_locked_documents_rels_emails_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("emails_id");



CREATE INDEX "payload_locked_documents_rels_invoices_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("invoices_id");



CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("media_id");



CREATE INDEX "payload_locked_documents_rels_order_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("order");



CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("parent_id");



CREATE INDEX "payload_locked_documents_rels_passkeys_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("passkeys_id");



CREATE INDEX "payload_locked_documents_rels_path_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("path");



CREATE INDEX "payload_locked_documents_rels_payments_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("payments_id");



CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("posts_id");



CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("projects_id");



CREATE INDEX "payload_locked_documents_rels_service_requests_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("service_requests_id");



CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("services_id");



CREATE INDEX "payload_locked_documents_rels_sessions_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("sessions_id");



CREATE INDEX "payload_locked_documents_rels_staff_invites_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("staff_invites_id");



CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("testimonials_id");



CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("users_id");



CREATE INDEX "payload_locked_documents_rels_verifications_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("verifications_id");



CREATE INDEX "payload_locked_documents_updated_at_idx" ON "public"."payload_locked_documents" USING "btree" ("updated_at");



CREATE INDEX "payload_migrations_created_at_idx" ON "public"."payload_migrations" USING "btree" ("created_at");



CREATE INDEX "payload_migrations_updated_at_idx" ON "public"."payload_migrations" USING "btree" ("updated_at");



CREATE INDEX "payload_preferences_created_at_idx" ON "public"."payload_preferences" USING "btree" ("created_at");



CREATE INDEX "payload_preferences_key_idx" ON "public"."payload_preferences" USING "btree" ("key");



CREATE INDEX "payload_preferences_rels_order_idx" ON "public"."payload_preferences_rels" USING "btree" ("order");



CREATE INDEX "payload_preferences_rels_parent_idx" ON "public"."payload_preferences_rels" USING "btree" ("parent_id");



CREATE INDEX "payload_preferences_rels_path_idx" ON "public"."payload_preferences_rels" USING "btree" ("path");



CREATE INDEX "payload_preferences_rels_users_id_idx" ON "public"."payload_preferences_rels" USING "btree" ("users_id");



CREATE INDEX "payload_preferences_updated_at_idx" ON "public"."payload_preferences" USING "btree" ("updated_at");



CREATE INDEX "payments_created_at_idx" ON "public"."payments" USING "btree" ("created_at");



CREATE UNIQUE INDEX "payments_square_payment_id_idx" ON "public"."payments" USING "btree" ("square_payment_id");



CREATE INDEX "payments_updated_at_idx" ON "public"."payments" USING "btree" ("updated_at");



CREATE INDEX "posts_created_at_idx" ON "public"."posts" USING "btree" ("created_at");



CREATE INDEX "posts_featured_image_idx" ON "public"."posts" USING "btree" ("featured_image_id");



CREATE INDEX "posts_keywords_order_idx" ON "public"."posts_keywords" USING "btree" ("_order");



CREATE INDEX "posts_keywords_parent_id_idx" ON "public"."posts_keywords" USING "btree" ("_parent_id");



CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "public"."posts_locales" USING "btree" ("_locale", "_parent_id");



CREATE UNIQUE INDEX "posts_slug_idx" ON "public"."posts" USING "btree" ("slug");



CREATE INDEX "posts_updated_at_idx" ON "public"."posts" USING "btree" ("updated_at");



CREATE INDEX "projects_created_at_idx" ON "public"."projects" USING "btree" ("created_at");



CREATE INDEX "projects_gallery_image_idx" ON "public"."projects_gallery" USING "btree" ("image_id");



CREATE INDEX "projects_gallery_order_idx" ON "public"."projects_gallery" USING "btree" ("_order");



CREATE INDEX "projects_gallery_parent_id_idx" ON "public"."projects_gallery" USING "btree" ("_parent_id");



CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "public"."projects_locales" USING "btree" ("_locale", "_parent_id");



CREATE UNIQUE INDEX "projects_slug_idx" ON "public"."projects" USING "btree" ("slug");



CREATE INDEX "projects_stats_locale_idx" ON "public"."projects_stats" USING "btree" ("_locale");



CREATE INDEX "projects_stats_order_idx" ON "public"."projects_stats" USING "btree" ("_order");



CREATE INDEX "projects_stats_parent_id_idx" ON "public"."projects_stats" USING "btree" ("_parent_id");



CREATE INDEX "projects_tags_order_idx" ON "public"."projects_tags" USING "btree" ("_order");



CREATE INDEX "projects_tags_parent_id_idx" ON "public"."projects_tags" USING "btree" ("_parent_id");



CREATE INDEX "projects_updated_at_idx" ON "public"."projects" USING "btree" ("updated_at");



CREATE INDEX "service_requests_assigned_tech_idx" ON "public"."service_requests" USING "btree" ("assigned_tech_id");



CREATE INDEX "service_requests_created_at_idx" ON "public"."service_requests" USING "btree" ("created_at");



CREATE INDEX "service_requests_customer_idx" ON "public"."service_requests" USING "btree" ("customer_id");



CREATE UNIQUE INDEX "service_requests_ticket_id_idx" ON "public"."service_requests" USING "btree" ("ticket_id");



CREATE INDEX "service_requests_updated_at_idx" ON "public"."service_requests" USING "btree" ("updated_at");



CREATE INDEX "services_created_at_idx" ON "public"."services" USING "btree" ("created_at");



CREATE INDEX "services_features_locale_idx" ON "public"."services_features" USING "btree" ("_locale");



CREATE INDEX "services_features_order_idx" ON "public"."services_features" USING "btree" ("_order");



CREATE INDEX "services_features_parent_id_idx" ON "public"."services_features" USING "btree" ("_parent_id");



CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "public"."services_locales" USING "btree" ("_locale", "_parent_id");



CREATE UNIQUE INDEX "services_slug_idx" ON "public"."services" USING "btree" ("slug");



CREATE INDEX "services_updated_at_idx" ON "public"."services" USING "btree" ("updated_at");



CREATE INDEX "sessions_created_at_idx" ON "public"."sessions" USING "btree" ("created_at");



CREATE UNIQUE INDEX "sessions_token_idx" ON "public"."sessions" USING "btree" ("token");



CREATE INDEX "sessions_updated_at_idx" ON "public"."sessions" USING "btree" ("updated_at");



CREATE INDEX "sessions_user_idx" ON "public"."sessions" USING "btree" ("user_id");



CREATE INDEX "settings_stats_order_idx" ON "public"."settings_stats" USING "btree" ("_order");



CREATE INDEX "settings_stats_parent_id_idx" ON "public"."settings_stats" USING "btree" ("_parent_id");



CREATE INDEX "settings_values_order_idx" ON "public"."settings_values" USING "btree" ("_order");



CREATE INDEX "settings_values_parent_id_idx" ON "public"."settings_values" USING "btree" ("_parent_id");



CREATE INDEX "site_settings_stats_order_idx" ON "public"."site_settings_stats" USING "btree" ("_order");



CREATE INDEX "site_settings_stats_parent_id_idx" ON "public"."site_settings_stats" USING "btree" ("_parent_id");



CREATE INDEX "site_settings_values_order_idx" ON "public"."site_settings_values" USING "btree" ("_order");



CREATE INDEX "site_settings_values_parent_id_idx" ON "public"."site_settings_values" USING "btree" ("_parent_id");



CREATE INDEX "staff_invites_created_at_idx" ON "public"."staff_invites" USING "btree" ("created_at");



CREATE UNIQUE INDEX "staff_invites_email_idx" ON "public"."staff_invites" USING "btree" ("email");



CREATE INDEX "staff_invites_invited_by_idx" ON "public"."staff_invites" USING "btree" ("invited_by_id");



CREATE INDEX "staff_invites_updated_at_idx" ON "public"."staff_invites" USING "btree" ("updated_at");



CREATE INDEX "testimonials_created_at_idx" ON "public"."testimonials" USING "btree" ("created_at");



CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "public"."testimonials_locales" USING "btree" ("_locale", "_parent_id");



CREATE INDEX "testimonials_updated_at_idx" ON "public"."testimonials" USING "btree" ("updated_at");



CREATE INDEX "users_created_at_idx" ON "public"."users" USING "btree" ("created_at");



CREATE UNIQUE INDEX "users_email_idx" ON "public"."users" USING "btree" ("email");



CREATE INDEX "users_role_order_idx" ON "public"."users_role" USING "btree" ("order");



CREATE INDEX "users_role_parent_idx" ON "public"."users_role" USING "btree" ("parent_id");



CREATE INDEX "users_sessions_order_idx" ON "public"."users_sessions" USING "btree" ("_order");



CREATE INDEX "users_sessions_parent_id_idx" ON "public"."users_sessions" USING "btree" ("_parent_id");



CREATE INDEX "users_updated_at_idx" ON "public"."users" USING "btree" ("updated_at");



CREATE INDEX "verifications_created_at_idx" ON "public"."verifications" USING "btree" ("created_at");



CREATE INDEX "verifications_identifier_idx" ON "public"."verifications" USING "btree" ("identifier");



CREATE INDEX "verifications_updated_at_idx" ON "public"."verifications" USING "btree" ("updated_at");



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."email_threads_rels"
    ADD CONSTRAINT "email_threads_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."email_threads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."email_threads_rels"
    ADD CONSTRAINT "email_threads_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."emails_rels"
    ADD CONSTRAINT "emails_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."emails_rels"
    ADD CONSTRAINT "emails_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."emails"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."emails"
    ADD CONSTRAINT "emails_thread_id_email_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."email_threads"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."passkeys"
    ADD CONSTRAINT "passkeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_accounts_fk" FOREIGN KEY ("accounts_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_admin_invitations_fk" FOREIGN KEY ("admin_invitations_id") REFERENCES "public"."admin_invitations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_email_threads_fk" FOREIGN KEY ("email_threads_id") REFERENCES "public"."email_threads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_emails_fk" FOREIGN KEY ("emails_id") REFERENCES "public"."emails"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_invoices_fk" FOREIGN KEY ("invoices_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_passkeys_fk" FOREIGN KEY ("passkeys_id") REFERENCES "public"."passkeys"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_payments_fk" FOREIGN KEY ("payments_id") REFERENCES "public"."payments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_service_requests_fk" FOREIGN KEY ("service_requests_id") REFERENCES "public"."service_requests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_sessions_fk" FOREIGN KEY ("sessions_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_staff_invites_fk" FOREIGN KEY ("staff_invites_id") REFERENCES "public"."staff_invites"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_verifications_fk" FOREIGN KEY ("verifications_id") REFERENCES "public"."verifications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_preferences_rels"
    ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payload_preferences_rels"
    ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."posts_keywords"
    ADD CONSTRAINT "posts_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts_locales"
    ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects_gallery"
    ADD CONSTRAINT "projects_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."projects_gallery"
    ADD CONSTRAINT "projects_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects_locales"
    ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects_stats"
    ADD CONSTRAINT "projects_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects_tags"
    ADD CONSTRAINT "projects_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_requests"
    ADD CONSTRAINT "service_requests_assigned_tech_id_users_id_fk" FOREIGN KEY ("assigned_tech_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."service_requests"
    ADD CONSTRAINT "service_requests_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."services_features"
    ADD CONSTRAINT "services_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."services_locales"
    ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."settings_stats"
    ADD CONSTRAINT "settings_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."settings_values"
    ADD CONSTRAINT "settings_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_settings_stats"
    ADD CONSTRAINT "site_settings_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_settings_values"
    ADD CONSTRAINT "site_settings_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."staff_invites"
    ADD CONSTRAINT "staff_invites_invited_by_id_users_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."testimonials_locales"
    ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users_role"
    ADD CONSTRAINT "users_role_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users_sessions"
    ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."accounts" TO "anon";
GRANT ALL ON TABLE "public"."accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."accounts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."accounts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."accounts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."accounts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."admin_invitations" TO "anon";
GRANT ALL ON TABLE "public"."admin_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_invitations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."admin_invitations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."admin_invitations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."admin_invitations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."email_threads" TO "anon";
GRANT ALL ON TABLE "public"."email_threads" TO "authenticated";
GRANT ALL ON TABLE "public"."email_threads" TO "service_role";



GRANT ALL ON SEQUENCE "public"."email_threads_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."email_threads_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."email_threads_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."email_threads_rels" TO "anon";
GRANT ALL ON TABLE "public"."email_threads_rels" TO "authenticated";
GRANT ALL ON TABLE "public"."email_threads_rels" TO "service_role";



GRANT ALL ON SEQUENCE "public"."email_threads_rels_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."email_threads_rels_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."email_threads_rels_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."emails" TO "anon";
GRANT ALL ON TABLE "public"."emails" TO "authenticated";
GRANT ALL ON TABLE "public"."emails" TO "service_role";



GRANT ALL ON SEQUENCE "public"."emails_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."emails_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."emails_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."emails_rels" TO "anon";
GRANT ALL ON TABLE "public"."emails_rels" TO "authenticated";
GRANT ALL ON TABLE "public"."emails_rels" TO "service_role";



GRANT ALL ON SEQUENCE "public"."emails_rels_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."emails_rels_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."emails_rels_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON SEQUENCE "public"."invoices_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."invoices_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."invoices_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."media" TO "anon";
GRANT ALL ON TABLE "public"."media" TO "authenticated";
GRANT ALL ON TABLE "public"."media" TO "service_role";



GRANT ALL ON SEQUENCE "public"."media_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."media_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."media_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."passkeys" TO "anon";
GRANT ALL ON TABLE "public"."passkeys" TO "authenticated";
GRANT ALL ON TABLE "public"."passkeys" TO "service_role";



GRANT ALL ON SEQUENCE "public"."passkeys_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."passkeys_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."passkeys_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payload_kv" TO "anon";
GRANT ALL ON TABLE "public"."payload_kv" TO "authenticated";
GRANT ALL ON TABLE "public"."payload_kv" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payload_kv_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payload_kv_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payload_kv_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payload_locked_documents" TO "anon";
GRANT ALL ON TABLE "public"."payload_locked_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."payload_locked_documents" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payload_locked_documents_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payload_locked_documents_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payload_locked_documents_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payload_locked_documents_rels" TO "anon";
GRANT ALL ON TABLE "public"."payload_locked_documents_rels" TO "authenticated";
GRANT ALL ON TABLE "public"."payload_locked_documents_rels" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payload_locked_documents_rels_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payload_locked_documents_rels_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payload_locked_documents_rels_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payload_migrations" TO "anon";
GRANT ALL ON TABLE "public"."payload_migrations" TO "authenticated";
GRANT ALL ON TABLE "public"."payload_migrations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payload_migrations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payload_migrations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payload_migrations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payload_preferences" TO "anon";
GRANT ALL ON TABLE "public"."payload_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."payload_preferences" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payload_preferences_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payload_preferences_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payload_preferences_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payload_preferences_rels" TO "anon";
GRANT ALL ON TABLE "public"."payload_preferences_rels" TO "authenticated";
GRANT ALL ON TABLE "public"."payload_preferences_rels" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payload_preferences_rels_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payload_preferences_rels_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payload_preferences_rels_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."posts_keywords" TO "anon";
GRANT ALL ON TABLE "public"."posts_keywords" TO "authenticated";
GRANT ALL ON TABLE "public"."posts_keywords" TO "service_role";



GRANT ALL ON TABLE "public"."posts_locales" TO "anon";
GRANT ALL ON TABLE "public"."posts_locales" TO "authenticated";
GRANT ALL ON TABLE "public"."posts_locales" TO "service_role";



GRANT ALL ON SEQUENCE "public"."posts_locales_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."posts_locales_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."posts_locales_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."projects_gallery" TO "anon";
GRANT ALL ON TABLE "public"."projects_gallery" TO "authenticated";
GRANT ALL ON TABLE "public"."projects_gallery" TO "service_role";



GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."projects_locales" TO "anon";
GRANT ALL ON TABLE "public"."projects_locales" TO "authenticated";
GRANT ALL ON TABLE "public"."projects_locales" TO "service_role";



GRANT ALL ON SEQUENCE "public"."projects_locales_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."projects_locales_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."projects_locales_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."projects_stats" TO "anon";
GRANT ALL ON TABLE "public"."projects_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."projects_stats" TO "service_role";



GRANT ALL ON TABLE "public"."projects_tags" TO "anon";
GRANT ALL ON TABLE "public"."projects_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."projects_tags" TO "service_role";



GRANT ALL ON TABLE "public"."service_requests" TO "anon";
GRANT ALL ON TABLE "public"."service_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."service_requests" TO "service_role";



GRANT ALL ON SEQUENCE "public"."service_requests_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."service_requests_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."service_requests_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON TABLE "public"."services_features" TO "anon";
GRANT ALL ON TABLE "public"."services_features" TO "authenticated";
GRANT ALL ON TABLE "public"."services_features" TO "service_role";



GRANT ALL ON SEQUENCE "public"."services_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."services_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."services_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."services_locales" TO "anon";
GRANT ALL ON TABLE "public"."services_locales" TO "authenticated";
GRANT ALL ON TABLE "public"."services_locales" TO "service_role";



GRANT ALL ON SEQUENCE "public"."services_locales_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."services_locales_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."services_locales_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sessions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sessions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sessions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."settings" TO "anon";
GRANT ALL ON TABLE "public"."settings" TO "authenticated";
GRANT ALL ON TABLE "public"."settings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."settings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."settings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."settings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."settings_stats" TO "anon";
GRANT ALL ON TABLE "public"."settings_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."settings_stats" TO "service_role";



GRANT ALL ON TABLE "public"."settings_values" TO "anon";
GRANT ALL ON TABLE "public"."settings_values" TO "authenticated";
GRANT ALL ON TABLE "public"."settings_values" TO "service_role";



GRANT ALL ON TABLE "public"."site_settings" TO "anon";
GRANT ALL ON TABLE "public"."site_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."site_settings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."site_settings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."site_settings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."site_settings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."site_settings_stats" TO "anon";
GRANT ALL ON TABLE "public"."site_settings_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."site_settings_stats" TO "service_role";



GRANT ALL ON TABLE "public"."site_settings_values" TO "anon";
GRANT ALL ON TABLE "public"."site_settings_values" TO "authenticated";
GRANT ALL ON TABLE "public"."site_settings_values" TO "service_role";



GRANT ALL ON TABLE "public"."staff_invites" TO "anon";
GRANT ALL ON TABLE "public"."staff_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."staff_invites" TO "service_role";



GRANT ALL ON SEQUENCE "public"."staff_invites_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."staff_invites_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."staff_invites_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."testimonials" TO "anon";
GRANT ALL ON TABLE "public"."testimonials" TO "authenticated";
GRANT ALL ON TABLE "public"."testimonials" TO "service_role";



GRANT ALL ON SEQUENCE "public"."testimonials_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."testimonials_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."testimonials_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."testimonials_locales" TO "anon";
GRANT ALL ON TABLE "public"."testimonials_locales" TO "authenticated";
GRANT ALL ON TABLE "public"."testimonials_locales" TO "service_role";



GRANT ALL ON SEQUENCE "public"."testimonials_locales_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."testimonials_locales_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."testimonials_locales_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."users_role" TO "anon";
GRANT ALL ON TABLE "public"."users_role" TO "authenticated";
GRANT ALL ON TABLE "public"."users_role" TO "service_role";



GRANT ALL ON SEQUENCE "public"."users_role_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."users_role_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."users_role_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."users_sessions" TO "anon";
GRANT ALL ON TABLE "public"."users_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."users_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."verifications" TO "anon";
GRANT ALL ON TABLE "public"."verifications" TO "authenticated";
GRANT ALL ON TABLE "public"."verifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."verifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."verifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."verifications_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































