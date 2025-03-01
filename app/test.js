// test.js
import postgres from 'postgres';

const sql = postgres('postgres://username:password@host:port/database');

async function testConnection() {
  try {
    const result = await sql`SELECT 1 + 1 AS result`;
    console.log('Connection successful:', result);
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testConnection();
