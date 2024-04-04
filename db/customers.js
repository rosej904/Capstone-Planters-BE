const client = require('./client');
const bcrypt = require("bcrypt")
const {createAddress} = require("./addresses")
const salt_count = 2

//---Gets and returns all customers and associated customer address---
async function getAllCustomers() {
    try {
        const { rows: customers } = await client.query(`
        SELECT *
        FROM customers
        `,);

        return customers;

    } catch (error) {
      throw error;
    }
}

//---Gets and returns specific customer and associated customer address---
async function getCustomerById(custId) {
    try {
        const { rows: [customer] } = await client.query(`
        SELECT *
        FROM customers
        WHERE id=$1;
        `,[custId]);

        return customer;
    } catch (error) {
        throw error;
    }
}

//---Gets and returns specific customer and associated customer address---
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

async function updateCustomer(id, fields = {}) {
    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
    
    // return early if this is called without fields
    if (setString.length === 0) {
        return;
    }
    
    try {
        const { rows: [ custRow ] } = await client.query(`
        UPDATE customers
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
        `, Object.values(fields));
    
        return custRow;
    } catch (error) {
        throw error;
    }
}

//---creates customer row in customers table. can also accept customer address as part of customer object---
async function createCustomer({ 
    username, 
    password,
    email,
    firstname,
    lastname,
    phone_number,
    role,
    address
  }) {
    try {
        let hashedPassword = await bcrypt.hash(password, salt_count)
        const { rows: [ customer ] } = await client.query(`
        INSERT INTO customers(username, password, email, firstname, lastname, phone_number, role) 
        VALUES($1, $2, $3, $4, $5, $6, $7) 
        ON CONFLICT (username) DO NOTHING 
        RETURNING *;
        `, [username, hashedPassword, email, firstname, lastname, phone_number, role]);
        
        if (address){
            await createAddress({
                customer_id: customer.id, 
                street_number: address.street_number, 
                street: address.street, 
                city: address.city,
                state: address.state,
                zip: address.zip
            });
        } 

        return customer;
    } catch (error) {
        throw error;
    }
    }

  module.exports = { getAllCustomers, getCustomerById, getCustByUsername, createCustomer, updateCustomer }