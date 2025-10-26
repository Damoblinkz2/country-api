const pool = require("./database");
const path = require("path");
const fs = require("fs");
const { replaceUndefined, generateSummaryImage } = require("./utils");

/**
 * Retrieves a list of countries from the database based on optional query parameters.
 * Supports filtering by region and currency, and sorting by GDP in descending order.
 * @param {Object} req - Express request object containing query parameters (region, currency, sort).
 * @param {Object} res - Express response object.
 * @returns {JSON} - Array of country objects or error message.
 */
const getCountries = async (req, res) => {
  try {
    // Extract query parameters for filtering and sorting
    const { region, currency, sort } = req.query;

    // Base SQL query to select all countries
    let sql = "SELECT * FROM countries";
    const conditions = [];
    const params = [];

    // Add condition for region filter if provided
    if (region) {
      conditions.push("region = ?");
      params.push(region);
    }

    // Add condition for currency filter if provided
    if (currency) {
      conditions.push("currency_code = ?");
      params.push(currency);
    }

    // Append WHERE clause if any conditions exist
    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    // Add sorting by GDP descending if specified
    if (sort === "gdp_desc") {
      sql += " ORDER BY estimated_gdp DESC";
    }

    // Execute the query with parameters
    const [rows] = await pool.query(sql, params);

    // Return the results as JSON
    res.status(200).json(rows);
  } catch (err) {
    // Log the error and return a generic error response
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
};

/**
 * Refreshes the countries data by creating the table if it doesn't exist,
 * fetching data from external APIs, and inserting/updating records in the database.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {JSON} - Success message or error message.
 */
const postCountries = async (req, res) => {
  try {
    // SQL to create the countries table if it doesn't exist
    const sql = `
      CREATE TABLE IF NOT EXISTS countries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        capital VARCHAR(100),
        region VARCHAR(100),
        population INT DEFAULT 0,
        currency_code VARCHAR(3),
        exchange_rate DECIMAL(10, 4) DEFAULT NULL,
        estimated_gdp DECIMAL(20, 2) DEFAULT NULL,
        flag_url VARCHAR(255),
        last_refreshed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
  `;

    // Execute table creation query
    const [result] = await pool.query(sql);
    console.log("✅ Table created successfully:", result);

    // Fetch countries data from REST Countries API
    const response = await fetch(
      "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies"
    );
    // Fetch exchange rates from Exchange Rate API
    const exchangeInUSD = await fetch(`https://open.er-api.com/v6/latest/USD`);

    // Parse JSON responses
    const countriesData = await response.json();
    const exchangeRateData = (await exchangeInUSD.json()).rates;

    // Loop through each country and process data
    for (let i = 0; i < countriesData.length; i++) {
      const country = replaceUndefined(countriesData[i], [
        "name",
        "capital",
        "region",
        "population",
        "currencies",
        "flag",
      ]);

      const { name, capital, region, population, currencies, flag } = country;

      // Extract currency code if available
      // const currencyCode = currencies?.length > 0 ? currencies[0].code : null;
      const currencyCode = currencies?.[0]?.code ?? null;

      // Get exchange rate for the currency
      const exchange_rate = currencyCode
        ? exchangeRateData[currencyCode]
          ? exchangeRateData[currencyCode]
          : null
        : null;

      // Calculate estimated GDP (simplified formula)
      const randomNumber = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
      const estimated_gdp = currencyCode
        ? exchange_rate
          ? population * (randomNumber / exchange_rate)
          : null
        : 0;

      // Set last refreshed timestamp
      const last_refreshed_at = new Date();

      // SQL to insert or update country data

      const sql = `
  INSERT INTO countries (
    name, capital, region, population, currency_code,
    exchange_rate, estimated_gdp, flag_url, last_refreshed_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    capital = VALUES(capital),
    region = VALUES(region),
    population = VALUES(population),
    currency_code = VALUES(currency_code),
    exchange_rate = VALUES(exchange_rate),
    estimated_gdp = VALUES(estimated_gdp),
    flag_url = VALUES(flag_url),
    last_refreshed_at = VALUES(last_refreshed_at)
`;

      // Execute insert/update query
      const [result] = await pool.execute(sql, [
        name,
        capital,
        region,
        population,
        currencyCode,
        exchange_rate,
        estimated_gdp,
        flag,
        last_refreshed_at,
      ]);
    }

    // 1️⃣ Query database for data
    const [allCountries] = await pool.query("SELECT * FROM countries");
    const totalCountries = allCountries.length;

    // Get top 5 countries by estimated_gdp
    const [top5] = await pool.query(`
      SELECT name, estimated_gdp
      FROM countries
      ORDER BY estimated_gdp DESC
      LIMIT 5
    `);

    // const lastRefreshedAt = new Date()

    await generateSummaryImage(totalCountries, top5, new Date());

    // Return success response
    res.status(201).json({ message: "data refreshed" });
  } catch (error) {
    // Log error and return error response
    console.error("Error fetching countries:", error);
    return res.status(500).json({ error: "Failed to fetch country data" });
  }
};

/**
 * Retrieves the total number of countries in the database.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {JSON} - Object with total count of countries.
 */
const getStatus = async (req, res) => {
  const [row] = await pool.query("SELECT * FROM countries");

  const last_refreshed_at = row[0].last_refreshed_at;

  const result = { total: row.length, last_refreshed_at };

  return res.status(200).json(result);
};

/**
 * Retrieves a specific country by name from the database.
 * @param {Object} req - Express request object containing the country name in params.
 * @param {Object} res - Express response object.
 * @returns {JSON} - Country object or error message.
 */
const getCountry = async (req, res) => {
  try {
    const name = req.params.name;
    const [row] = await pool.query("SELECT * FROM countries WHERE name = ?", [
      name,
    ]);
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
};

/**
 * Deletes a specific country by name from the database.
 * @param {Object} req - Express request object containing the country name in params.
 * @param {Object} res - Express response object.
 * @returns {JSON} - Success message or error message.
 */
const deleteCountry = async (req, res) => {
  try {
    const name = req.params.name;
    await pool.query("DELETE FROM countries WHERE name = ?", [name]);
    res.json({ message: "Country deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
};

/**
 * Retrieves the summary image from the cache directory.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Stream} - PNG image stream or error message.
 */
const getImg = (req, res) => {
  const imagePath = path.join(process.cwd(), "cache", "summary.png");

  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: "Summary image not found" });
  }

  // Tell the browser (or Thunder Client) this is an image
  res.setHeader("Content-Type", "image/png");

  // Send the actual file
  fs.createReadStream(imagePath).pipe(res);
};

module.exports = {
  getCountries,
  postCountries,
  getStatus,
  getCountry,
  deleteCountry,
  getImg,
};
