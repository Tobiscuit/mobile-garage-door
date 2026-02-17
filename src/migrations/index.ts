import * as migration_20260213_230840 from './20260213_230840';
import * as migration_20260214_014444_add_note_to_payments from './20260214_014444_add_note_to_payments';
import * as migration_20260214_120000_fix_schema from './20260214_120000_fix_schema';
import * as migration_20260214_140000_add_square_customer_id_to_users from './20260214_140000_add_square_customer_id_to_users';
import * as migration_20260215_051510_add_customer_type_and_company_name_to_users from './20260215_051510_add_customer_type_and_company_name_to_users';
import * as migration_20260216_011500_add_better_auth_tables from './20260216_011500_add_better_auth_tables';
import * as migration_20260217_210333_add_projects_warranty_fields from './20260217_210333_add_projects_warranty_fields';

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
    name: '20260217_210333_add_projects_warranty_fields'
  },
];
