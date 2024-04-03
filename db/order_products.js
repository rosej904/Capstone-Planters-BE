const client = require('./client');

async function createOrderProducts(body){
  const {order_id, inventory_id, quantity} = body;
  try {
      const { rows: [ orderProducts ] } = await client.query(`
      INSERT INTO order_products(order_id, inventory_id, quantity)
      VALUES($1, $2, $3) 
      RETURNING *;
      `, [order_id, inventory_id, quantity]);
  

      return orderProducts;
  } catch (error) {
      throw error;
  }
}


module.exports = {createOrderProducts}