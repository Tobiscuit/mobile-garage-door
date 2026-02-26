const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URI });

async function run() {
  await client.connect();
  try {
    var check = await client.query('SELECT COUNT(*) as cnt FROM settings');
    if (parseInt(check.rows[0].cnt) === 0) {
      await client.query("INSERT INTO settings (warranty_enable_notifications, updated_at, created_at) VALUES (false, NOW(), NOW())");
      console.log('Seeded initial settings row with defaults.');
    } else {
      console.log('Settings row already exists (' + check.rows[0].cnt + ' rows).');
    }

    // Final verification
    var r = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='settings' ORDER BY ordinal_position");
    console.log('FINAL COLUMNS:', r.rows.map(function(x) { return x.column_name; }).join(', '));
    var data = await client.query('SELECT id, company_name, phone, theme_preference FROM settings LIMIT 1');
    console.log('VERIFICATION ROW:', JSON.stringify(data.rows[0]));
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await client.end();
  }
}

run();
