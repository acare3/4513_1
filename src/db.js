const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'data', 'f1.db');

// Initialize a read-only connection to the assignment SQLite database.
const database = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (error) => {
  if (error) {
    console.error('Failed to connect to SQLite database:', error.message);
  } else {
    console.log(`Connected to SQLite database at ${dbPath}`);
  }
});

/**
 * Executes a query expected to return multiple rows.
 * @param {string} sql - SQL query string.
 * @param {Array} params - Query parameters.
 * @returns {Promise<Array>} Resolves with the resulting rows.
 */
const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    database.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });

/**
 * Executes a query expected to return a single row.
 * @param {string} sql - SQL query string.
 * @param {Array} params - Query parameters.
 * @returns {Promise<object|undefined>} Resolves with the resulting row.
 */
const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    database.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
      } else {
        resolve(row);
      }
    });
  });

module.exports = {
  all,
  get,
};
