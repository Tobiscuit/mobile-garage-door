import * as migration_20260213_230840 from './20260213_230840';

export const migrations = [
  {
    up: migration_20260213_230840.up,
    down: migration_20260213_230840.down,
    name: '20260213_230840'
  },
];
