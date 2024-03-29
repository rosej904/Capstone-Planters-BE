const { Client } = require('pg') // imports the pg module

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/planters-dev',
});

/**
 * customer Methods
 */

async function getAllCustomers() {
    try {
      const { rows } = await client.query(`
        SELECT id, username, password, email, firstname, lastname, phone_number, role
        FROM customers;
      `);
    
      return rows;
    } catch (error) {
      throw error;
    }
  }

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

async function createAddress({
    customer_id,
    street_number,
    street,
    city,
    state,
    zip
  }) {
    try {
      const { rows: [ address ] } = await client.query(`
        INSERT INTO addresses(customer_id, street_number, street, city, state, zip) 
        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `, [customer_id, street_number, street, city, state, zip]);
  
      return address
    } catch (error) {
      throw error;
    }
  }

/**
 * invetory Methods
 */

/**
 * invetory_type Methods
 */


module.exports = { client, getAllCustomers, createCustomer, createAddress }