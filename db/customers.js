const client = require('./client');


async function getAllCustomers() {
    try {
        const { rows: customerIds } = await client.query(`
            SELECT id
            FROM customers;
        `);
        const customers = await Promise.all(customerIds.map(customer => getCustomerById( customer.id )
    ));

      return customers;
    } catch (error) {
      throw error;
    }
  }

async function getCustomerById(custId) {
    try {
        const { rows: [customer] } = await client.query(`
        SELECT *
        FROM customers
        WHERE id=$1;
        `,[custId]);

        const { rows: address } = await client.query(`
        SELECT street_number, street, city, state, zip
        FROM addresses
        WHERE id=$1;
        `,[custId]);

        customer.address = address
        return customer;
    } catch (error) {
        throw error;
    }
}

async function getCustByUsername(userName) {
    try {
      const { rows: [ user ] } = await client.query(`
        SELECT *
        FROM customers
        WHERE username=$1
      `, [ userName ]);
  
      if (!user) {
        throw {
          name: "UserNotFoundError",
          message: "A user with that username does not exist"
        }
      }
  
      return user;
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
      const { rows: [ customers ] } = await client.query(`
        INSERT INTO customers(username, password, email, firstname, lastname, phone_number, role) 
        VALUES($1, $2, $3, $4, $5, $6, $7) 
        ON CONFLICT (username) DO NOTHING 
        RETURNING *;
      `, [username, password, email, firstname, lastname, phone_number, role]);
  
      return customers;
    } catch (error) {
      throw error;
    }
  }

  module.exports = { getAllCustomers, getCustomerById, getCustByUsername, createCustomer }