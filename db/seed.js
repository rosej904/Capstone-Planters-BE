const client  = require('./client');
const { getAllCustomers, createCustomer, createAddress, createInventory } = require('./index');

// ---Dropping tables in order if they exist---
async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
      DROP TABLE IF EXISTS shipments;
      DROP TABLE IF EXISTS order_products;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS cart_products;
      DROP TABLE IF EXISTS cart;
      DROP TABLE IF EXISTS inventory;
      DROP TABLE IF EXISTS inventory_type;
      DROP TABLE IF EXISTS addresses;
      DROP TABLE IF EXISTS customers;
    `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

//---creating tables in order---
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
            type varchar(255) NOT NULL
          );

          CREATE TABLE inventory (
            id SERIAL PRIMARY KEY,
            type_id INTEGER REFERENCES inventory_type(id),
            name varchar(255) NOT NULL,
            description varchar(255) NOT NULL,
            price numeric NOT NULL,
            quantity INTEGER NOT NULL,
            imgUrl varchar(255) NOT NULL
          );

          CREATE TABLE cart (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER REFERENCES customers(id),
            order_date varchar(255) NOT NULL,
            total_proce varchar(255) NOT NULL,
            converted varchar(255) NOT NULL
          );

          CREATE TABLE cart_products (
            id SERIAL PRIMARY KEY,
            cart_id INTEGER REFERENCES cart(id),
            inventory_id INTEGER REFERENCES inventory(id),
            quantity INTEGER NOT NULL
          );

          CREATE TABLE orders (
            id SERIAL PRIMARY KEY,
            cart INTEGER REFERENCES cart(id),
            customer_id INTEGER REFERENCES customers(id),
            order_date varchar(255) NOT NULL,
            total_proce varchar(255) NOT NULL,
            processed varchar(255) NOT NULL
          );

          CREATE TABLE order_products (
            id SERIAL PRIMARY KEY,
            order_id INTEGER REFERENCES orders(id),
            inventory_id INTEGER REFERENCES inventory(id),
            quantity INTEGER NOT NULL
          );

          CREATE TABLE shipments (
            id SERIAL PRIMARY KEY,
            order_id INTEGER REFERENCES orders(id),
            shipment_date varchar(255) NOT NULL,
            tracking_number varchar(255) NOT NULL
          );

        `);
  
      console.log("Finished building tables!");
    } catch (error) {
      console.error("Error building tables!");
      throw error;
    }
  }

  //---seeding db with new customer data---
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
        role: 'admin',
        address: {
          street_number: "111",
          street: "green street",
          city: "green city",
          state: "green state",
          zip: "11111"
      }
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
        lastname: 'Arellano',
        phone_number: '111-222-3333',
        role: 'admin' 
      });
      console.log("Finished creating customers!");
    } catch (error) {
      console.error("Error creating customers!");
      throw error;
    }
  }

  //---Seeding db with new address data---
  async function createInitialAddresses() {
    try {
        console.log("Starting to create addresses...");
        const [brittney, jordan, ami, emily] = await getAllCustomers();

        // await createAddress({
        //     customer_id: brittney.id,
        //     street_number: "111",
        //     street: "green street",
        //     city: "green city",
        //     state: "green state",
        //     zip: "11111"
        // });

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

async function createInitialInventory(){
  try{
    console.log("Creating Inventory . . . ")

    await createInventory({
      itemId: seeds.id,
      name: "Green Bean",
      description: "The perfect addition to any vegetable garden. Beans are a vine and as such will also need a structure to grow on.",
      Price: 2.00,
      Quantity: 60
    });

    await createInventory({
      itemId: seeds.id,
      name: "Strawberry",
      description: "Sweet red berry perfect for dessert. Vines can easily spread. Grows in a patch close to the ground.",
      Price: 2.00,
      Quantity: 20
    });

    await createInventory({
      itemId: seeds.id,
      name: "Tomato",
      description: "Perfect fruit for using in sauces or as a topping on a sandwich. Start seeds indoors and move outside once the plant is 12 inches tall.",
      Price: 2.50,
      Quantity: 50
    });

    await createInventory({
      itemId: seeds.id,
      name: "Red Pepper",
      description: "Perfect for salads or stuffed peppers. 1-2 plants can yeild as many as 45 peppers in a short time.",
      Price: 1.50,
      Quantity: 80
    });

    await createInventory({
      itemId: seeds.id,
      name: "Carrot",
      description: "EEEEHHH, What's Up Doc? These carrots are perfect for all your cooking needs. Contrary to popular belief, carrots can be grown in window boxes.",
      Price: 1.25,
      Quantity: 100
    });

    await createInventory({
      itemId: indoor.id,
      name: "Monstera",
      description: "The large green leaves of the monstera plant gives it it's name. Some of the leaves will have large holes, making them look like claws.",
      Price: 40.00,
      Quantity: 10
    });

    await createInventory({
      itemId: indoor.id,
      name: "Succulent",
      description: "Succulents require very little water and are perfect for those of us who forget to water the plants.",
      Price: 5.00,
      Quantity: 60
    });

    await createInventory({
      itemId: indoor.id,
      name: "Snake Plant",
      description: "This zebra striped hardy plant adds a sense of drama to any indoor space.",
      Price: 20.00,
      Quantity: 40
    });

    await createInventory({
      itemId: indoor.id,
      name: "Spider Plant",
      description: "The spider plant thrives best in an area where it can branch out and it's babies can drop down. When a baby plant has formed air roots, simply trim it and stick in dirt for a new plant.",
      Price: 5.00,
      Quantity: 20
    });

    await createInventory({
      itemId: indoor.id,
      name: "Money Tree",
      description: "Sorry, it's not real money, but the money tree is said to bring luck and money into your house.",
      Price: 15.00,
      Quantity: 50
    });

    await createInventory({
      itemId: flowers.id,
      name: "Sunflower",
      description: "This bright yellow, annual flower towers over everything else in the gardem. The seeds can be roasted for a great treat, but watch out because the birds like to eat the seeds too.",
      Price: 10.00,
      Quantity: 50
    });

    await createInventory({
      itemId: flowers.id,
      name: "Tulip",
      description: "These beautiful spring perennials will multiply on their own in your garden due to being a bulb plant. They are also like candy for deer and will attrack them from miles away.",
      Price: 10.00,
      Quantity: 40
    });

    await createInventory({
      itemId: flowers.id,
      name: "Dahlia",
      description: "These beautiful, round, perennial flowers look like living tissue paper pompoms. They come in every color imaginable and some even have multiple colors in a flower.",
      Price: 12.00,
      Quantity: 60
    });

    await createInventory({
      itemId: flowers.id,
      name: "Rose",
      description: "This traditional rose plant is a hardy perennial. Watch out, it has mean thorns.",
      Price: 25.00,
      Quantity: 80
    });

    await createInventory({
      itemId: flowers.id,
      name: "Beared Iris",
      description: "These perennial bulb flowers are tall and create many six petaled flowers per plant. The beareded iris flowers are wavy or fuzzy in apperance",
      Price: 10.00,
      Quantity: 80
    });

    await createInventory({
      itemId: supplies.id,
      name: "Raised Bed Soil",
      description: "Raised bed soil is perfectly designed to give your raised garden the right blend of nutrients to grow your planst nice and strong. 1.5 cu. ft. bag will cover 3'X3' bed in 1 inces of soil.",
      Price: 10.00,
      Quantity: 60
    });

    await createInventory({
      itemId: supplies.id,
      name: "Weed Killer",
      description: "Use this shaker-top container of weed killing pellets in your flower garden. Do not use on a vegitable or food garden.",
      Price: 20.00,
      Quantity: 20
    });

    await createInventory({
      itemId: supplies.id,
      name: "Organic Fertilizer",
      description: "This organic fertilizer is safe to use on vegetables and food plants. Apply the fertilizer to the soil before planting and mix into the soil.",
      Price: 25.00,
      Quantity: 40
    });

    await createInventory({
      itemId: supplies.id,
      name: "Brown Mulch",
      description: "2 CU F bag of mulch will cover 4x4 foot garden bed in 1 inch of mulch.",
      Price: 2.50,
      Quantity: 100
    });

    await createInventory({
      itemId: supplies.id,
      name: "Mexican River Rock",
      description: ".25 CU F bacg of 3-5 inch Mexican river rock will cover appx. half foot square area.",
      Price: 25.00,
      Quantity: 80
    });

    await createInventory({
      itemId: tools.id,
      name: "Two Wheel Gorrila Cart",
      description: "With a 4.5 CU F or 300 LB capacity, the two wheeled Gorrilla Cart will become your favorite wheelbarrow.",
      Price: 60.00,
      Quantity: 10
    });

    await createInventory({
      itemId: tools.id,
      name: "Ego Electric Lawn Mower",
      description: "This 21 inch electric walk-behind lawn mower is self-propelled. It comes with a 56V rechargable battery and charger.",
      Price: 600.00,
      Quantity: 10
    });

    await createInventory({
      itemId: tools.id,
      name: "39 inch Digging Shovel",
      description: "This digging shovel is the perfect fit for anyone under 5.5 feet tall. This will dig holes through the toughest lawn conditions.",
      Price: 32.00,
      Quantity: 20
    });

    await createInventory({
      itemId: tools.id,
      name: "Basic Lawn Rake",
      description: "This basic, plastic lawn rake will make leaf pick up easy.",
      Price: 8.00,
      Quantity: 100
    });

    await createInventory({
      itemId: tools.id,
      name: "Lawn Bags",
      description: "These large paper bags will allow you to put your yard waste and leaves on the curb for pick-up in most cities.",
      Price: 2.00,
      Quantity: 200
    });

  console.log("Finished creating inventory!");
} catch (error) {
    console.log("Error creating inventory!");
    throw error;
}

}

  //---rebuildDB runs all required functions to create new instance of DB tables and data---
  async function rebuildDB() {
    try {
      client.connect();
      await dropTables();
      await createTables();
      await createInitialCustomers()
      await createInitialAddresses()
      // await createInitialInventory()
    } catch (error) {
      console.log("Error during rebuildDB")
      throw error;
    }
  }

  //---runs rebuildDB and disconnects from client when done---
  rebuildDB().catch(console.error).finally(() => client.end());