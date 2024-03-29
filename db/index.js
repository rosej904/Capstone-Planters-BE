const { Client } = require('pg') // imports the pg module

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/planters-dev',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

/**
 * customer Methods
 */

/**
 * addresses Methods
 */

/**
 * invetory Methods
 */

/**
 * invetory_type Methods
 */


module.exports = { client }