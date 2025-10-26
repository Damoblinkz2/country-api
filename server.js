/**
 * Main server file for the Currency Exchange API.
 * Sets up Express server, middleware, routes, and database connection.
 */

const express = require("express");
const pool = require("./database");
const {
  getCountries,
  postCountries,
  getStatus,
  getCountry,
  deleteCountry,
  getImg,
} = require("./controller");
require("dotenv").config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Get port from environment variables
const PORT = process.env.PORT;

// Test database connection on startup
pool
  .getConnection()
  .then((conn) => {
    console.log("✅ Connected to MySQL");
    conn.release(); // release the connection back to the pool
  })
  .catch((err) => console.error("❌ Connection failed:", err));

// Define routes
app.route("/countries").get(getCountries);
app.route("/countries/refresh").post(postCountries);
app.route("/status").get(getStatus);
app.route("/countries/:name").get(getCountry).delete(deleteCountry);
app.route("/currencies/image").get(getImg);

/**
 * Starts the Express server.
 */
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

// Start the server
startServer();
