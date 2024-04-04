const client = require("./client");
const {getInventoryById} = require("./inventory")

//---gets all carts (admin function) object by cust ID---
async function getAllCarts() {
    try {
        const { rows: carts } = await client.query(`
            SELECT 
            * FROM cart
        `,);
        return carts;
    } catch (error) {
      throw error;
    }
}

//get cart by cart_id
async function getCartById(id) {
    try {
        const { rows: carts } = await client.query(`
            SELECT 
            * FROM cart
            WHERE id=$1
        `,[id]);
        return carts;
    } catch (error) {
      throw error;
    }
}

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

//---updates cart, accepts id and object with fields to update---
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

//---adds products to existing cart---
async function updateCartProducts(cart_id, inventory_id, quantity ) {

    try {
        const { rows: [ cartProduct ] } = await client.query(`
        UPDATE cart_products
        SET quantity=$2
        WHERE cart_id=$1 AND inventory_id=$3
        RETURNING *;
        `, [cart_id, quantity, inventory_id]);
        await updateCartPrice(cart_id)

        return cartProduct;
    } catch (error) {
        throw error;
    }
}

async function destroyCartProducts(id, productId, quantity) {
    try {
        const { rows: [ cartProduct ] } = await client.query(`
        DELETE FROM cart_products 
        WHERE cart_id=$1 AND inventory_id=$2
        RETURNING *;
        `, [id, productId]);
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


//---cart utils---
//---can be called with customer_id to return cart plus items
async function cartBuilder(custId){
    let displayCart = await getCartByCustId(custId)
    const products = await getCartProductsByCartId(displayCart.id)
    items=[]
    

    for (i of products){
        items[i.inventory_id] = await getInventoryById(i.inventory_id);
        items[i.inventory_id].quantity = i.quantity
        displayCart.items = items.filter(function (el) {
            return el != null;
          });
    }

    return displayCart
}

//---updates cart table total_price---
async function updateCartPrice(id, productId, quantity) {
    try {
        const products = await getCartProductsByCartId(id)
        let totalPrice = 0
        
        for (i of products){
            
            let inv = await getInventoryById(i.inventory_id)
            tempPrice = i.quantity * inv.price
            totalPrice = totalPrice+tempPrice
        }
        
        const cartObj = {
            total_price: totalPrice
        }
        await updateCart(id, cartObj)
        return

    } catch (error) {
        throw error;
    }
}

    

module.exports = { addToCart, getCartByCustId, getCartProductsByCartId, cartBuilder, getAllCarts, updateCartProducts, destroyCartProducts }