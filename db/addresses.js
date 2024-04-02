
const client = require('./client');

//---gets and returns address object by customer_id---
async function getAddressByID(custId) {
    try {
        const { rows: [address] } = await client.query(`
        SELECT *
        FROM addresses
        WHERE customer_id=$1;
        `,[custId]);

      return address;
    } catch (error) {
      throw error;
    }
}


//---creates address row in addresses table---
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

  module.exports = { getAddressByID, createAddress }