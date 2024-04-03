const client = require('./client');

async function createInventory(body){
    const { name, description, price, quantity} = body;
    try {
        const { rows: [ inventoryItem ] } = await client.query(`
        INSERT INTO inventory(name, description, price, quantity) 
        VALUES($1, $2, $3, $4,) 
        RETURNING *;
        `, [name, description, price, quantity]);
    

        return inventoryItem;
    } catch (error) {
        throw error;
    }
    }

module.exports = {createInventory}