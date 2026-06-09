'use strict';

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

/**
 * Database file path — uses DB_PATH env var for testing, otherwise defaults
 * to data/carbon_footprint.db relative to the project root.
 */
const DB_DIR = path.resolve(__dirname, '..', '..', 'data');
const DB_FILE = process.env.DB_PATH || path.join(DB_DIR, 'carbon_footprint.db');

// Ensure data directory exists (skip for in-memory DBs used in tests)
if (DB_FILE !== ':memory:' && !fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

/** @type {DatabaseSync} */
let db;

/**
 * Initialise (or re-initialise) the database connection and run the schema.
 * Called automatically on first require; can be called again in tests to
 * swap to an in-memory database.
 *
 * @param {string} [dbPath] — optional override (e.g. ':memory:' for tests)
 * @returns {DatabaseSync}
 */
function initDb(dbPath) {
  const filePath = dbPath || DB_FILE;

  if (db) {
    try { db.close(); } catch (_) { /* already closed */ }
  }

  db = new DatabaseSync(filePath);

  // Performance & safety pragmas
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // Execute schema
  const schemaPath = path.resolve(__dirname, '..', '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  return db;
}

// Initialise on first load
initDb();

/**
 * Run an INSERT / UPDATE / DELETE statement.
 * @param {string} sql
 * @param {any[]} [params]
 * @returns {{changes: number, lastInsertRowid: number|bigint}}
 */
function run(sql, params = []) {
  return db.prepare(sql).run(...(Array.isArray(params) ? params : [params]));
}

/**
 * Fetch a single row.
 * @param {string} sql
 * @param {any[]} [params]
 * @returns {any}
 */
function get(sql, params = []) {
  return db.prepare(sql).get(...(Array.isArray(params) ? params : [params]));
}

/**
 * Fetch all rows.
 * @param {string} sql
 * @param {any[]} [params]
 * @returns {any[]}
 */
function all(sql, params = []) {
  return db.prepare(sql).all(...(Array.isArray(params) ? params : [params]));
}

/**
 * Return the raw node:sqlite DatabaseSync instance.
 * @returns {DatabaseSync}
 */
function getDb() {
  return db;
}

module.exports = { initDb, getDb, run, get, all };
