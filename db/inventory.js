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

async function getInventoryByName(name) {
    try {
        const { rows: [ inventoryItem ] } = await client.query(`
        SELECT *
        FROM inventory
        WHERE LOWER(name) LIKE LOWER('%${name}%')
        `);
    
        if (!name) {
        throw {
            name: "NoInventoryByName",
            message: "A product with that name was not found"
        }
        }
        return inventoryItem;
    } catch (error) {
        throw error;
    }
}

async function getInventoryById(id) {
    try {
        const { rows: [ inventoryItem ] } = await client.query(`
        SELECT *
        FROM inventory
        WHERE id = ($1)
        `, [ id ]);
    
        if (!id) {
        throw {
            name: "NoInventoryByID",
            message: "A product with that ID was not found"
        }
        }
        return inventoryItem;
    } catch (error) {
        throw error;
    }
}

module.exports = {createInventory, getInventoryByName, getInventoryById}