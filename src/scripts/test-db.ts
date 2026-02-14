
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

async function testConnection() {
  console.log('Testing DB Connection...');
  const connectionString = process.env.DATABASE_URI;
  
  if (!connectionString) {
    console.error('DATABASE_URI is missing');
    return;
  }

  // Mask password for logging
  const masked = connectionString.replace(/:([^:@]+)@/, ':****@');
  console.log(`Connection String: ${masked}`);

  const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false // Often needed for Supabase/Cloud providers
    }
  });

  try {
    const client = await pool.connect();
    console.log('Connected successfully!');
    
    const res = await client.query('SELECT NOW()');
    console.log('Time:', res.rows[0].now);
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Connection Failed:', err);
  }
}

testConnection();
