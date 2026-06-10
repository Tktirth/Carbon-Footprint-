'use strict';

const { DatabaseSync } = require('node:sqlite');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_DIR = path.resolve(__dirname, '..', '..', 'data');
let DB_FILE = process.env.DB_PATH || path.join(DB_DIR, 'carbon_footprint.db');

// Use writeable /tmp directory on Google Cloud Run
if (process.env.K_SERVICE) {
  DB_FILE = '/tmp/carbon_footprint.db';
}

// Enable Postgres if DATABASE_URL is provided, but allow fallback
let isPostgres = !!process.env.DATABASE_URL;

let db;
let pool;

function initPostgresPool() {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Supabase / Cloud SQL standard connections
    },
    max: 5, // Protect Supabase connection exhaustion in serverless environments
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000 // 5 seconds connection timeout
  });
}

function ensureSqliteDir() {
  if (DB_FILE !== ':memory:' && !fs.existsSync(path.dirname(DB_FILE))) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  }
}

if (isPostgres) {
  initPostgresPool();
} else {
  ensureSqliteDir();
}

/**
 * Initialise database tables.
 * Made asynchronous to support PostgreSQL remote setup.
 */
async function initDb(dbPath) {
  if (isPostgres) {
    let client;
    try {
      client = await pool.connect();
      // Acquire session-level advisory lock using a unique lock key (e.g. 1781034)
      await client.query('SELECT pg_advisory_lock(1781034)');
      
      const schemaPath = path.resolve(__dirname, '..', '..', 'database', 'postgres_schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      await client.query(schema);
      console.log('⚡ Supabase PostgreSQL Database Initialised successfully.');
    } catch (err) {
      console.error('⚠️ Failed to connect to Postgres/Supabase. Falling back to SQLite:', err.message);
      isPostgres = false;
      ensureSqliteDir();
      initSqlite(dbPath);
    } finally {
      if (client) {
        // Release advisory lock and return client back to pool
        await client.query('SELECT pg_advisory_unlock(1781034)').catch(() => {});
        client.release();
      }
    }
  } else {
    initSqlite(dbPath);
  }
}

function initSqlite(dbPath) {
  const filePath = dbPath || DB_FILE;
  if (db) {
    try { db.close(); } catch (_) {}
  }
  db = new DatabaseSync(filePath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  const schemaPath = path.resolve(__dirname, '..', '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log('⚡ SQLite Database Initialised successfully.');
}

// Automatically fire init on startup
initDb().catch((err) => {
  console.error('❌ Initial Database Setup Failed:', err);
});

/**
 * Helper to convert standard '?' parameters to Postgres '$1, $2' parameters.
 */
function convertSql(sql) {
  let count = 1;
  return sql.replace(/\?/g, () => `$${count++}`);
}

/**
 * Run an INSERT / UPDATE / DELETE statement asynchronously.
 * Returns standard { changes, lastInsertRowid } structure.
 */
async function run(sql, params = []) {
  const paramArray = Array.isArray(params) ? params : [params];
  if (isPostgres) {
    let pgSql = sql;
    const isInsert = sql.trim().toUpperCase().startsWith('INSERT');
    if (isInsert && !sql.toUpperCase().includes('RETURNING')) {
      pgSql += ' RETURNING id';
    }
    const converted = convertSql(pgSql);
    const result = await pool.query(converted, paramArray);
    return {
      changes: result.rowCount,
      lastInsertRowid: isInsert ? (result.rows[0]?.id || null) : null
    };
  } else {
    return db.prepare(sql).run(...paramArray);
  }
}

/**
 * Fetch a single row asynchronously.
 */
async function get(sql, params = []) {
  const paramArray = Array.isArray(params) ? params : [params];
  if (isPostgres) {
    const result = await pool.query(convertSql(sql), paramArray);
    return result.rows[0] || null;
  } else {
    return db.prepare(sql).get(...paramArray);
  }
}

/**
 * Fetch all rows asynchronously.
 */
async function all(sql, params = []) {
  const paramArray = Array.isArray(params) ? params : [params];
  if (isPostgres) {
    const result = await pool.query(convertSql(sql), paramArray);
    return result.rows;
  } else {
    return db.prepare(sql).all(...paramArray);
  }
}

function getDb() {
  return isPostgres ? pool : db;
}

module.exports = {
  initDb,
  getDb,
  run,
  get,
  all,
  get isPostgres() {
    return isPostgres;
  }
};
