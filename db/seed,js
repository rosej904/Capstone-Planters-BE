
const { client } = require('./index');

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    // have to make sure to drop in correct order
    await client.query(`
      DROP TABLE IF EXISTS addresses;
      DROP TABLE IF EXISTS inventory_type;
      DROP TABLE IF EXISTS inventory;
      DROP TABLE IF EXISTS customers;
    `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

async function createTables() {
    try {
      console.log("Starting to build tables...");
  
      await client.query(`

        CREATE TABLE addresses (
            id SERIAL PRIMARY KEY,
            street_number varchar(255) NOT NULL,
            street varchar(255) NOT NULL,
            city varchar(255) NOT NULL,
            state varchar(255) NOT NULL,
            zip varchar(255) NOT NULL
        );

        CREATE TABLE customers (
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL,
            email varchar(255) NOT NULL,
            firstname varchar(255) NOT NULL,
            lastname varchar(255) NOT NULL,
            addressId INTEGER REFERENCES addresses(id),
            phone_number varchar(255) NOT NULL,
            role varchar(255) NOT NULL
        );
  
        CREATE TABLE inventory_type (
            id SERIAL PRIMARY KEY,
            type varchar(255) UNIQUE NOT NULL
        );
  
        CREATE TABLE inventory (
            id SERIAL PRIMARY KEY,
            typeId INTEGER REFERENCES inventory_type(id),
            name varchar(255) UNIQUE NOT NULL,
            description varchar(255) UNIQUE NOT NULL,
            price varchar(255) UNIQUE NOT NULL,
            quantity varchar(255) UNIQUE NOT NULL
        );
      `);
  
      console.log("Finished building tables!");
    } catch (error) {
      console.error("Error building tables!");
      throw error;
    }
  }