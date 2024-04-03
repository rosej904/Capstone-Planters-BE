const client = require('./client');

async function createInventory(body){
    const {type_id, name, description, price, quantity} = body;
    try {
        const { rows: [ inventoryItem ] } = await client.query(`
        INSERT INTO inventory(type_id, name, description, price, quantity, imgUrl) 
        VALUES($1, $2, $3, $4, $5, $6) 
        RETURNING *;
        `, [type_id, name, description, price, quantity, "imgUrl"]);
    

        return inventoryItem;
    } catch (error) {
        throw error;
    }
    }

module.exports = {createInventory}