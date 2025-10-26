/**
 * Database configuration and connection pool setup.
 * Uses mysql2 to create a connection pool for MySQL database.
 */

const mysql = require("mysql2");
require("dotenv").config();

// Create a connection pool for efficient database connections
const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .promise();

module.exports = pool;
