const { Client } = require('pg') // imports the pg module

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/planters-dev',
});

module.exports = client