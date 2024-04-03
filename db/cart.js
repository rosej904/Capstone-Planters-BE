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

async function getCartProductsByCartId(cartId) {
    try {
        const { rows: cartProducts } = await client.query(`
            SELECT 
            * FROM cart_products
            where cart_id=$1;
        `,[cartId]);
        return cartProducts;
        
    } catch (error) {
    throw error;
    }
}

//---updates cart table total_price---
async function updateCartPrice(id, productId, quantity) {
    try {
        const product = await getInventoryById(productId)
        totalPrice = product.price * quantity
        const cartObj = {
            total_price: totalPrice
        }
        await updateCart(id, cartObj)
        return

    } catch (error) {
        throw error;
    }
}

//---updates cart with fields passed by object---
async function updateCart(id, fields = {}) {
    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
    
    // return early if this is called without fields
    if (setString.length === 0) {
        return;
    }
    
    try {
        const { rows: [ cartRow ] } = await client.query(`
        UPDATE cart
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
        `, Object.values(fields));
    
        return cartRow;
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

        //cart builder
        const displayCart = cartBuilder(customer_id)

        return displayCart

    } catch (error) {
        throw error;
    }
}

//---can be called with customer_id to return cart plus items
async function cartBuilder(custId){
    let displayCart = await getCartByCustId(custId)
    const products = await getCartProductsByCartId(displayCart.id)
    const productsArr = []
    displayCart.items={}

    for (i = 0; i < products.length; i++){
        productsArr[i] = products[i]["inventory_id"];
     }

    for (id in productsArr){
        displayCart.items[productsArr[id]]= await getInventoryById(productsArr[id]);
    }
    return displayCart
}

    

module.exports = { addToCart }