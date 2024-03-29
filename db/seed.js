
const client  = require('./client');
const { getAllCustomers, createCustomer, createAddress } = require('./index');

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    // have to make sure to drop in correct order
    await client.query(`
      DROP TABLE IF EXISTS addresses;
      DROP TABLE IF EXISTS customers;
      DROP TABLE IF EXISTS inventory;
      DROP TABLE IF EXISTS inventory_type;
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

        CREATE TABLE customers (
          id SERIAL PRIMARY KEY,
          username varchar(255) UNIQUE NOT NULL,
          password varchar(255) NOT NULL,
          email varchar(255) NOT NULL,
          firstname varchar(255) NOT NULL,
          lastname varchar(255) NOT NULL,
          phone_number varchar(255) NOT NULL,
          role varchar(255) NOT NULL
      );

        CREATE TABLE addresses (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER REFERENCES customers(id),
            street_number varchar(255) NOT NULL,
            street varchar(255) NOT NULL,
            city varchar(255) NOT NULL,
            state varchar(255) NOT NULL,
            zip varchar(255) NOT NULL
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

  async function createInitialCustomers() {
    try {
      console.log("Starting to create customers...");
  
      await createCustomer({ 
        username: 'brittd', 
        password: 'password1',
        email: 'brittney@gmail.com',
        firstname: 'Brittney',
        lastname: 'DeWitt',
        phone_number: '111-222-3333',
        role: 'admin' 
      });
      await createCustomer({ 
        username: 'jordanr', 
        password: 'password2',
        email: 'jordan@gmail.com',
        firstname: 'Jordan',
        lastname: 'Rose',
        phone_number: '111-222-3333',
        role: 'admin' 
      });
      await createCustomer({ 
        username: 'amib', 
        password: 'password3',
        email: 'ami@gmail.com',
        firstname: 'Ami',
        lastname: 'Bray',
        phone_number: '111-222-3333',
        role: 'admin' 
      });
      await createCustomer({ 
        username: 'emilya', 
        password: 'password4',
        email: 'Emily@gmail.com',
        firstname: 'Emily',
        lastname: 'Arelano',
        phone_number: '111-222-3333',
        role: 'admin' 
      });
      console.log("Finished creating customers!");
    } catch (error) {
      console.error("Error creating customers!");
      throw error;
    }
  }

  async function createInitialAddresses() {
    try {
        const [brittney, jordan, ami, emily] = await getAllCustomers();

        console.log("Starting to create addresses...");
        await createAddress({
            customer_id: brittney.id,
            street_number: "111",
            street: "green street",
            city: "green city",
            state: "green state",
            zip: "11111"
        });

        await createAddress({
            customer_id: jordan.id,
            street_number: "222",
            street: "blue street",
            city: "blue city",
            state: "blue state",
            zip: "22222"
        });

        await createAddress({
            customer_id: ami.id,
            street_number: "333",
            street: "orange street",
            city: "orange city",
            state: "orange state",
            zip: "33333"
        });

        await createAddress({
            customer_id: emily.id,
            street_number: "444",
            street: "red street",
            city: "red city",
            state: "red state",
            zip: "44444"
        });
        console.log("Finished creating addresses!");
    } catch (error) {
        console.log("Error creating addresses!");
        throw error;
    }
}

  async function rebuildDB() {
    try {
      client.connect();
      await dropTables();
      await createTables();
      await createInitialCustomers()
      await createInitialAddresses()
    } catch (error) {
      console.log("Error during rebuildDB")
      throw error;
    }
  }

  rebuildDB().catch(console.error).finally(() => client.end());