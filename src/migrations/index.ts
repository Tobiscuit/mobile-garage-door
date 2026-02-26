import * as migration_20260213_230840 from './20260213_230840';
import * as migration_20260214_014444_add_note_to_payments from './20260214_014444_add_note_to_payments';
import * as migration_20260214_120000_fix_schema from './20260214_120000_fix_schema';
import * as migration_20260214_140000_add_square_customer_id_to_users from './20260214_140000_add_square_customer_id_to_users';
import * as migration_20260215_051510_add_customer_type_and_company_name_to_users from './20260215_051510_add_customer_type_and_company_name_to_users';
import * as migration_20260216_011500_add_better_auth_tables from './20260216_011500_add_better_auth_tables';
import * as migration_20260217_210333_add_projects_warranty_fields from './20260217_210333_add_projects_warranty_fields';
import * as migration_20260220_010443_add_html_content_to_posts from './20260220_010443_add_html_content_to_posts';
import * as migration_20260220_194139 from './20260220_194139';
import * as migration_20260223_161338 from './20260223_161338';
import * as migration_20260224_202811_enable_i18n_localization from './20260224_202811_enable_i18n_localization';
import * as migration_20260225_212643_add_vi_locale from './20260225_212643_add_vi_locale';

export const migrations = [
  {
    up: migration_20260213_230840.up,
    down: migration_20260213_230840.down,
    name: '20260213_230840',
  },
  {
    up: migration_20260214_014444_add_note_to_payments.up,
    down: migration_20260214_014444_add_note_to_payments.down,
    name: '20260214_014444_add_note_to_payments',
  },
  {
    up: migration_20260214_120000_fix_schema.up,
    down: migration_20260214_120000_fix_schema.down,
    name: '20260214_120000_fix_schema',
  },
  {
    up: migration_20260214_140000_add_square_customer_id_to_users.up,
    down: migration_20260214_140000_add_square_customer_id_to_users.down,
    name: '20260214_140000_add_square_customer_id_to_users',
  },
  {
    up: migration_20260215_051510_add_customer_type_and_company_name_to_users.up,
    down: migration_20260215_051510_add_customer_type_and_company_name_to_users.down,
    name: '20260215_051510_add_customer_type_and_company_name_to_users',
  },
  {
    up: migration_20260216_011500_add_better_auth_tables.up,
    down: migration_20260216_011500_add_better_auth_tables.down,
    name: '20260216_011500_add_better_auth_tables',
  },
  {
    up: migration_20260217_210333_add_projects_warranty_fields.up,
    down: migration_20260217_210333_add_projects_warranty_fields.down,
    name: '20260217_210333_add_projects_warranty_fields',
  },
  {
    up: migration_20260220_010443_add_html_content_to_posts.up,
    down: migration_20260220_010443_add_html_content_to_posts.down,
    name: '20260220_010443_add_html_content_to_posts',
  },
  {
    up: migration_20260220_194139.up,
    down: migration_20260220_194139.down,
    name: '20260220_194139',
  },
  {
    up: migration_20260223_161338.up,
    down: migration_20260223_161338.down,
    name: '20260223_161338',
  },
  {
    up: migration_20260224_202811_enable_i18n_localization.up,
    down: migration_20260224_202811_enable_i18n_localization.down,
    name: '20260224_202811_enable_i18n_localization',
  },
  {
    up: migration_20260225_212643_add_vi_locale.up,
    down: migration_20260225_212643_add_vi_locale.down,
    name: '20260225_212643_add_vi_locale'
  },
];
