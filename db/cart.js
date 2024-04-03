const client = require("./client");
const {getInventoryById} = require("./inventory")

//---gets cart object by cust ID---
async function getCartByCustId(custId) {
    try {
        const { rows: cart } = await client.query(`
            SELECT 
            * FROM cart
            where customer_id=$1;
        `,[custId]);

      return cart[0];
    } catch (error) {
      throw error;
    }
}

//---updates cart table total_price---
async function updateCartPrice(id, productId, quantity) {
    try {
        const product = await getInventoryById(productId)

        totalPrice = product.price * quantity

        await client.query(`
        UPDATE cart
        SET total_price = $1
        WHERE id=$2
        `, [totalPrice, id]);

        return

    } catch (error) {
        throw error;
    }
}

//---adds products to existing cart---
async function addCartProducts(id, quantity, productId) {
    try {
        const { rows: [ cartProduct ] } = await client.query(`
        INSERT INTO cart_products(cart_id, inventory_id, quantity) 
        VALUES($1, $2, $3) 
        RETURNING *;
        `, [id, productId, quantity]);
        await updateCartPrice(id, productId, quantity)

        return cartProduct;
    } catch (error) {
        throw error;
    }
}

//---creates new cart row for cust, if cust alredy has cart row calls addCartProducts for existing cart---
async function addToCart(body) {
    try {
        const {customer_id, quantity, product} = body
        const existingCart = await getCartByCustId(customer_id)
        if (existingCart){
            if (product){
                await addCartProducts(existingCart.id, quantity, product.id)
            }
        } else {
            const { rows: [ cartEntry ] } = await client.query(`
            INSERT INTO cart(customer_id) 
            VALUES($1) 
            RETURNING *;
            `, [customer_id]);

            if (product){
                await addCartProducts(cartEntry.id, quantity, product.id)
            }
        }   
        return

    } catch (error) {
        throw error;
    }
}


    

module.exports = { addToCart }