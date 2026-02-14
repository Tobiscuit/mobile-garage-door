import * as migration_20260213_230840 from './20260213_230840';
import * as migration_20260214_014444_add_note_to_payments from './20260214_014444_add_note_to_payments';
import * as migration_20260214_120000_fix_schema from './20260214_120000_fix_schema';

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
    name: '20260214_120000_fix_schema'
  },
];
