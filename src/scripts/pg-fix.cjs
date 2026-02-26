const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URI });

async function run() {
  await client.connect();
  try {
    // Create the enum type if it doesn't exist
    await client.query(
      "DO $$ BEGIN CREATE TYPE \"public\".\"enum_settings_theme_preference\" AS ENUM('candlelight', 'original'); EXCEPTION WHEN duplicate_object THEN null; END $$;"
    );
    console.log('[1/3] Enum type created/verified.');

    // Add all missing columns from the merged SiteSettings
    var cols = [
      ["company_name", "varchar DEFAULT 'Mobil Garage Door Pros' NOT NULL"],
      ["phone", "varchar DEFAULT '832-419-1293' NOT NULL"],
      ["email", "varchar DEFAULT 'service@mobilgaragedoor.com' NOT NULL"],
      ["license_number", "varchar DEFAULT 'TX Registered & Bonded'"],
      ["insurance_amount", "varchar DEFAULT '$2M Policy'"],
      ["bbb_rating", "varchar DEFAULT 'A+'"],
      ["mission_statement", "varchar"],
      ["brand_voice", "varchar"],
      ["brand_tone", "varchar"],
      ["brand_avoid", "varchar"],
      ["theme_preference", "\"enum_settings_theme_preference\" DEFAULT 'candlelight'"]
    ];

    for (var i = 0; i < cols.length; i++) {
      var name = cols[i][0];
      var def = cols[i][1];
      var sql = 'ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "' + name + '" ' + def + ';';
      await client.query(sql);
      console.log('[2/3] Added column: ' + name);
    }

    // Create indexes on array tables if missing
    await client.query('CREATE INDEX IF NOT EXISTS "settings_stats_order_idx" ON "settings_stats" USING btree ("_order");');
    await client.query('CREATE INDEX IF NOT EXISTS "settings_stats_parent_id_idx" ON "settings_stats" USING btree ("_parent_id");');
    await client.query('CREATE INDEX IF NOT EXISTS "settings_values_order_idx" ON "settings_values" USING btree ("_order");');
    await client.query('CREATE INDEX IF NOT EXISTS "settings_values_parent_id_idx" ON "settings_values" USING btree ("_parent_id");');
    console.log('[3/3] Indexes verified.');

    // Verify final state
    var r = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='settings' ORDER BY ordinal_position");
    console.log('\nFINAL SETTINGS COLUMNS:', r.rows.map(function(x) { return x.column_name; }).join(', '));
    console.log('\n✅ Database schema is now fully synchronized!');
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await client.end();
  }
}

run();
