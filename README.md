# Currency Exchange API

A Node.js Express API that provides country data with currency exchange rates and estimated GDP calculations.

## Features

- Retrieve countries with filtering by region and currency
- Sort countries by estimated GDP
- Refresh country data from external APIs
- Get individual country details
- Delete countries from the database
- Get API status information

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **REST Countries API** - Country data source
- **Exchange Rate API** - Currency exchange rates

## Prerequisites

- Node.js (v14 or higher)
- MySQL database
- Environment variables configured

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd currency-converter
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   MYSQL_HOST=localhost
   MYSQL_USER=your_mysql_username
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DATABASE=your_database_name
   PORT=3000
   ```

4. Ensure your MySQL database is running and accessible.

## Usage

### Starting the Server

```bash
node server.js
```

The server will start on the port specified in your `.env` file (default: 3000).

### API Endpoints

#### GET /countries

Retrieves a list of countries with optional filtering and sorting.

**Query Parameters:**

- `region` (string): Filter by region (e.g., "Europe")
- `currency` (string): Filter by currency code (e.g., "USD")
- `sort` (string): Sort by "gdp_desc" for GDP descending

**Example:**

```
GET /countries?region=Europe&sort=gdp_desc
```

#### POST /countries/refresh

Refreshes the countries data by fetching from external APIs and updating the database.

**Example:**

```
POST /countries/refresh
```

#### GET /status

Returns the total number of countries in the database.

**Example:**

```
GET /status
```

#### GET /countries/:name

Retrieves details for a specific country by name.

**Example:**

```
GET /countries/France
```

#### DELETE /countries/:name

Deletes a specific country from the database.

**Example:**

```
DELETE /countries/France
```

#### GET /currencies/image

Retrieves the generated summary image showing total countries and top 5 by GDP.

**Example:**

```
GET /currencies/image
```

Returns a PNG image file.

## Database Schema

The `countries` table includes the following fields:

- `id` (INT, Primary Key, Auto Increment)
- `name` (VARCHAR(100), NOT NULL)
- `capital` (VARCHAR(100), NOT NULL)
- `region` (VARCHAR(100), NOT NULL)
- `population` (INT, DEFAULT 0)
- `currency_code` (VARCHAR(3), UNIQUE, NOT NULL)
- `exchange_rate` (INT, DEFAULT 0)
- `estimated_gdp` (INT, DEFAULT 0)
- `flag_url` (VARCHAR(100), NOT NULL)
- `last_refreshed_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

## Error Handling

The API includes comprehensive error handling:

- Database connection errors
- Invalid requests
- External API failures
- Missing data scenarios

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
