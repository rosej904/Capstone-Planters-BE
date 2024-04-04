const client = require('./client');

// get all shipment
async function getAllShipment(){
    try{
        const { rows: [ shipment ] } = await client.query(`
        SELECT * 
        FROM shipments;
        `)
    }catch(error){
        console.log("failed to get all shipment")
        throw error
    }
}

// get shipment from id
async function getAllShipmentById(shipId){
    try{
        const { rows: [ shipment ] } = await client.query(`
        SELECT * 
        FROM shipments
        WHERE Id = $1;
        `,[shipId])
    }catch(error){
        console.log("failed to get all shipment")
        throw error
    }
}

// create
async function createShipment(body){
const {order_id, tracking_number} = body

try{
    const { rows: [ shippment ] } = await client.query(`
    INSERT INTO shipments(order_id, tracking_number)
    VALUES($1, $2)
    RETURNING *;
    `,[order_id, tracking_number])
    
    return shippment;
}catch(error){
    throw error
}
}


// update shipment


// delete shipment

module.exports = {createShipment}