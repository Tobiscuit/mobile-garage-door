const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URI });

async function run() {
  await client.connect();

  var tables = ['user', 'session', 'account', 'verification', 'passkey'];
  for (var i = 0; i < tables.length; i++) {
    var r = await client.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='" + tables[i] + "' ORDER BY ordinal_position"
    );
    console.log('\n' + tables[i].toUpperCase() + ':');
    r.rows.forEach(function(row) {
      console.log('  ' + row.column_name + ' (' + row.data_type + ')');
    });
  }

  // Check if user exists
  var users = await client.query('SELECT id, email, name FROM "user" LIMIT 5');
  console.log('\nUSER ROWS:', JSON.stringify(users.rows));

  // Check verification table  
  var veri = await client.query('SELECT * FROM verification LIMIT 5');
  console.log('\nVERIFICATION ROWS:', JSON.stringify(veri.rows));

  await client.end();
}

run();
