const { Client } = require('pg') // imports the pg module

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/planters-dev',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

/**
 * customer Methods
 */

async function createCustomer({ 
    username, 
    password,
    email,
    firstname,
    lastname,
    phone_number,
    role
  }) {
    try {
      const { rows: [ user ] } = await client.query(`
        INSERT INTO customers(username, password, email, firstname, lastname, phone_number, role) 
        VALUES($1, $2, $3, $4, $5, $6, $7) 
        ON CONFLICT (username) DO NOTHING 
        RETURNING *;
      `, [username, password, email, firstname, lastname, phone_number, role]);
  
      return user;
    } catch (error) {
      throw error;
    }
  }


/**
 * addresses Methods
 */


/**
 * invetory Methods
 */

/**
 * invetory_type Methods
 */


module.exports = { client, createCustomer }