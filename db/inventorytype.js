const client = require('./client');

//---gets and returns address object by customer_id---
async function createInventoryType(type){
    try {
        const { rows: [types] } = await client.query(`
        INSERT INTO inventory_type (type) 
        VALUES($1) 
        RETURNING *;
        `, [type.type]);

      return types;
    } catch (error) {
      throw error;
    }
}

async function getAllTypes() {
    try {
        const { rows: types } = await client.query(`
            SELECT *
            FROM inventory_type;
        `);
        

      return types;
    } catch (error) {
      throw error;
    }
}

module.exports = {createInventoryType, getAllTypes}