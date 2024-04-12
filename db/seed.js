const client = require('./client');
const { getAllCustomers, createCustomer, createAddress, createInventoryType, createInventory, getInventoryByName, getAllTypes, addToCart, createOrder, createOrderProducts, addCartProducts, updateCartPrice, getCartByCustId } = require('./index');

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
      DROP TABLE IF EXISTS carts;
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
            email varchar(255) UNIQUE NOT NULL,
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
            price INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            imgUrl varchar(255) NOT NULL
          );

          CREATE TABLE carts (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER REFERENCES customers(id),
            updated_date DATE NOT NULL DEFAULT CURRENT_DATE,
            total_price INTEGER NOT NULL DEFAULT 0,
            converted BOOLEAN NOT NULL DEFAULT FALSE
          );

          CREATE TABLE cart_products (
            id SERIAL PRIMARY KEY,
            cart_id INTEGER REFERENCES carts(id),
            inventory_id INTEGER REFERENCES inventory(id),
            quantity INTEGER NOT NULL
          );

          CREATE TABLE orders (
            id SERIAL PRIMARY KEY,
            cart_id INTEGER REFERENCES carts(id),
            customer_id INTEGER REFERENCES customers(id),
            order_date DATE NOT NULL DEFAULT CURRENT_DATE,
            total_price INTEGER NOT NULL,
            processed BOOLEAN NOT NULL DEFAULT FALSE
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

async function createInitialInventoryType() {
  try {
    console.log("Creating Inventory Type . . . ")

    await createInventoryType({
      type: "seeds"
    });

    await createInventoryType({
      type: "indoor"
    });

    await createInventoryType({
      type: "flowers"
    });

    await createInventoryType({
      type: "supplies"
    });

    await createInventoryType({
      type: "tools"
    });

    console.log("Finished creating type!");
  } catch (error) {
    console.log("Error creating type!");
    throw error;
  }
}

async function createInitialInventory() {
  try {
    console.log("Creating Inventory . . . ")
    const [seeds, indoor, flowers, supplies, tools] = await getAllTypes()

    await createInventory({
      type_id: seeds.id,
      name: "Green Bean",
      description: "The perfect addition to any vegetable garden. Beans are a vine and as such will also need a structure to grow on.",
      price: 200,
      quantity: 60
    });

    await createInventory({
      type_id: seeds.id,
      name: "Strawberry",
      description: "Sweet red berry perfect for dessert. Vines can easily spread. Grows in a patch close to the ground.",
      price: 200,
      quantity: 20
    });

    await createInventory({
      type_id: seeds.id,
      name: "Tomato",
      description: "Perfect fruit for using in sauces or as a topping on a sandwich. Start seeds indoors and move outside once the plant is 12 inches tall.",
      price: 250,
      quantity: 50
    });

    await createInventory({
      type_id: seeds.id,
      name: "Red Pepper",
      description: "Perfect for salads or stuffed peppers. 1-2 plants can yeild as many as 45 peppers in a short time.",
      price: 150,
      quantity: 80
    });

    await createInventory({
      type_id: seeds.id,
      name: "Carrot",
      description: "EEEEHHH, What's Up Doc? These carrots are perfect for all your cooking needs. Contrary to popular belief, carrots can be grown in window boxes.",
      price: 125,
      quantity: 100
    });

    await createInventory({
      type_id: indoor.id,
      name: "Monstera",
      description: "The large green leaves of the monstera plant gives it it's name. Some of the leaves will have large holes, making them look like claws.",
      price: 4000,
      quantity: 10
    });

    await createInventory({
      type_id: indoor.id,
      name: "Succulent",
      description: "Succulents require very little water and are perfect for those of us who forget to water the plants.",
      price: 500,
      quantity: 60
    });

    await createInventory({
      type_id: indoor.id,
      name: "Snake Plant",
      description: "This zebra striped hardy plant adds a sense of drama to any indoor space.",
      price: 2000,
      quantity: 40
    });

    await createInventory({
      type_id: indoor.id,
      name: "Spider Plant",
      description: "The spider plant thrives best in an area where it can branch out and it's babies can drop down. When a baby plant has formed air roots, simply trim it and stick in dirt for a new plant.",
      price: 500,
      quantity: 20
    });

    await createInventory({
      type_id: indoor.id,
      name: "Money Tree",
      description: "Sorry, it's not real money, but the money tree is said to bring luck and money into your house.",
      price: 1500,
      quantity: 50
    });

    await createInventory({
      type_id: flowers.id,
      name: "Sunflower",
      description: "This bright yellow, annual flower towers over everything else in the gardem. The seeds can be roasted for a great treat, but watch out because the birds like to eat the seeds too.",
      price: 1000,
      quantity: 50
    });

    await createInventory({
      type_id: flowers.id,
      name: "Tulip",
      description: "These beautiful spring perennials will multiply on their own in your garden due to being a bulb plant. They are also like candy for deer and will attrack them from miles away.",
      price: 1000,
      quantity: 40
    });

    await createInventory({
      type_id: flowers.id,
      name: "Dahlia",
      description: "These beautiful, round, perennial flowers look like living tissue paper pompoms. They come in every color imaginable and some even have multiple colors in a flower.",
      price: 1200,
      quantity: 60
    });

    await createInventory({
      type_id: flowers.id,
      name: "Rose",
      description: "This traditional rose plant is a hardy perennial. Watch out, it has mean thorns.",
      price: 2500,
      quantity: 80
    });

    await createInventory({
      type_id: flowers.id,
      name: "Beared Iris",
      description: "These perennial bulb flowers are tall and create many six petaled flowers per plant. The beareded iris flowers are wavy or fuzzy in apperance",
      price: 1000,
      quantity: 80
    });

    await createInventory({
      type_id: supplies.id,
      name: "Raised Bed Soil",
      description: "Raised bed soil is perfectly designed to give your raised garden the right blend of nutrients to grow your planst nice and strong. 1.5 cu. ft. bag will cover 3'X3' bed in 1 inces of soil.",
      price: 1000,
      quantity: 60
    });

    await createInventory({
      type_id: supplies.id,
      name: "Weed Killer",
      description: "Use this shaker-top container of weed killing pellets in your flower garden. Do not use on a vegitable or food garden.",
      price: 2000,
      quantity: 20
    });

    await createInventory({
      type_id: supplies.id,
      name: "Organic Fertilizer",
      description: "This organic fertilizer is safe to use on vegetables and food plants. Apply the fertilizer to the soil before planting and mix into the soil.",
      price: 2500,
      quantity: 40
    });

    await createInventory({
      type_id: supplies.id,
      name: "Brown Mulch",
      description: "2 CU F bag of mulch will cover 4x4 foot garden bed in 1 inch of mulch.",
      price: 250,
      quantity: 100
    });

    await createInventory({
      type_id: supplies.id,
      name: "Mexican River Rock",
      description: ".25 CU F bacg of 3-5 inch Mexican river rock will cover appx. half foot square area.",
      price: 2500,
      quantity: 80
    });

    await createInventory({
      type_id: tools.id,
      name: "Two Wheel Gorrila Cart",
      description: "With a 4.5 CU F or 300 LB capacity, the two wheeled Gorrilla Cart will become your favorite wheelbarrow.",
      price: 6000,
      quantity: 10
    });

    await createInventory({
      type_id: tools.id,
      name: "Ego Electric Lawn Mower",
      description: "This 21 inch electric walk-behind lawn mower is self-propelled. It comes with a 56V rechargable battery and charger.",
      price: 60000,
      quantity: 10
    });

    await createInventory({
      type_id: tools.id,
      name: "39 inch Digging Shovel",
      description: "This digging shovel is the perfect fit for anyone under 5.5 feet tall. This will dig holes through the toughest lawn conditions.",
      price: 3200,
      quantity: 20
    });

    await createInventory({
      type_id: tools.id,
      name: "Basic Lawn Rake",
      description: "This basic, plastic lawn rake will make leaf pick up easy.",
      price: 800,
      quantity: 100
    });

    await createInventory({
      type_id: tools.id,
      name: "Lawn Bags",
      description: "These large paper bags will allow you to put your yard waste and leaves on the curb for pick-up in most cities.",
      price: 200,
      quantity: 200
    });

    console.log("Finished creating inventory!");
  } catch (error) {
    console.log("Error creating inventory!");
    throw error;
  }

}

//---Seeding db with new cart data---
async function createInitialCartEntries() {
  try {
    console.log("Starting to create cart entries...");
    const [brittney, jordan, ami, emily] = await getAllCustomers();
    const sberry = await getInventoryByName("strawberry");
    const shov = await getInventoryByName("shovel");
    const tulip = await getInventoryByName("tulip");

    let returnCart = await addToCart(brittney.id);
    await addCartProducts(returnCart.id, sberry.id, 2)
    await updateCartPrice(returnCart.id)


    returnCart = await addToCart(jordan.id);
    await addCartProducts(returnCart.id, shov.id, 1)
    await updateCartPrice(returnCart.id)

    returnCart = await addToCart(ami.id);
    await addCartProducts(returnCart.id, tulip.id, 5)
    await updateCartPrice(returnCart.id)

    returnCart = await addToCart(emily.id);
    await addCartProducts(returnCart.id, sberry.id, 1)
    await updateCartPrice(returnCart.id)

    const existingCart = await getCartByCustId(emily.id, false)
    await addCartProducts(existingCart.id, shov.id, 2)
    await updateCartPrice(existingCart.id)

    console.log("Finished creating initial cart data!");
  } catch (error) {
    console.error("Error creating cart entries!");
    throw error;
  }
}

//---Seeding db with new order data---
async function createInitialOrder() {
  try {
    console.log("Creating Order . . . ")

    await createOrder({
      cart_id: 1,
      customer_id: 1,
      total_price: 5
    });
    console.log("Finished creating order!");
  } catch (error) {
    console.log("Error creating order!");
    throw error;
  }
}

//---Seeding db with new order data---
async function createInitialOrderProducts() {
  try {
    console.log("Creating Order Products . . . ")

    await createOrderProducts({
      order_id: 1,
      inventory_id: 1,
      quantity: 1,
    });
    console.log("Finished creating order products!");
  } catch (error) {
    console.log("Error creating order products!");
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
    await createInitialInventoryType()
    await createInitialInventory()
    await createInitialCartEntries()
    await createInitialOrder()
    await createInitialOrderProducts()
  } catch (error) {
    console.log("Error during rebuildDB")
    throw error;
  }
}

//---runs rebuildDB and disconnects from client when done---
rebuildDB().catch(console.error).finally(() => client.end());