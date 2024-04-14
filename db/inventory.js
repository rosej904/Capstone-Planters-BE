const client = require('./client');

async function getAllInventory() {
    try {
        const { rows: inventory } = await client.query(`
        SELECT *
        FROM inventory
        `,);

        return inventory;

    } catch (error) {
        throw error;
    }
}

async function updateInventory(id, fields = {}) {
    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
    
    // return early if this is called without fields
    if (setString.length === 0) {
        return;
    }
    
    try {
        const { rows: [ invRow ] } = await client.query(`
        UPDATE inventory
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
        `, Object.values(fields));
    
        return invRow;
    } catch (error) {
        throw error;
    }
}

async function createInventory(body){
    const {type_id, name, description, price, quantity, imgUrl} = body;
    try {
        const { rows: [ inventoryItem ] } = await client.query(`
        INSERT INTO inventory(type_id, name, description, price, quantity, imgUrl) 
        VALUES($1, $2, $3, $4, $5, $6) 
        RETURNING *;
        `, [type_id, name, description, price, quantity, imgUrl]);
    

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

async function destroyInventory(id) {
    try {
        const { rows: [inventory] } = await client.query(`
        DELETE FROM inventory
        WHERE id=$1
        RETURNING *;
        `, [id]);

        return inventory;
    } catch (error) {
        throw error;
    }
}

module.exports = {getAllInventory, createInventory, updateInventory, getInventoryByName, getInventoryById, destroyInventory}