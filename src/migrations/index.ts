import * as migration_20260211_004447 from './20260211_004447';

export const migrations = [
  {
    up: migration_20260211_004447.up,
    down: migration_20260211_004447.down,
    name: '20260211_004447'
  },
];
