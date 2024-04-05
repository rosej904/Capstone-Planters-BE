const client = require('./client');


async function createOrder(body) {
  const { cart_id, customer_id, total_price } = body;
  try {
    const { rows: [order] } = await client.query(`
      INSERT INTO orders(cart_id, customer_id, total_price)
      VALUES($1, $2, $3) 
      RETURNING *;
      `, [cart_id, customer_id, total_price]);


    return order;
  } catch (error) {
    throw error;
  }
}


module.exports = { createOrder }