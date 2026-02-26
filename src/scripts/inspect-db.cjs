const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URI });

async function run() {
  await client.connect();

  const r1 = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='settings' ORDER BY ordinal_position"
  );
  console.log('SETTINGS COLUMNS:', r1.rows.map(function(x) { return x.column_name; }).join(', '));

  const r2 = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='settings_stats' ORDER BY ordinal_position"
  );
  console.log('STATS COLUMNS:', r2.rows.map(function(x) { return x.column_name; }).join(', '));

  const r3 = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='settings_values' ORDER BY ordinal_position"
  );
  console.log('VALUES COLUMNS:', r3.rows.map(function(x) { return x.column_name; }).join(', '));

  const r4 = await client.query("SELECT * FROM settings LIMIT 1");
  console.log('SETTINGS ROW COUNT:', r4.rowCount);

  await client.end();
}

run();
