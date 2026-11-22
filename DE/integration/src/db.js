// db.js : single shared connection pool + transaction helper
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                       // max simultaneous connections
  idleTimeoutMillis: 30000,
});

/** Run one parameterised query. Always pass values in `params` (never string-concatenate) to prevent SQL injection. */
const query = (text, params) => pool.query(text, params);

/** Run several statements atomically: COMMIT if all succeed, ROLLBACK if any fails. */
async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
