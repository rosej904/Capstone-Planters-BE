const express = require('express');
const cartRouter = express.Router();
require("dotenv").config();
const {requireUser, RouteError} = require("./utils")
const {getAllCarts, cartBuilder, getCartProductsByCartId, destroyCartProducts, updateCartProducts, addToCart} = require('../db');

//---mounts get all carts (admin function) - returns all carts with details---
cartRouter.get('/all', async (req, res, next) => {
    try {
        const carts = await getAllCarts()
        let displayCarts = []
        for (i of carts){
            const singleCart = await cartBuilder(i.customer_id)
            displayCarts.push(singleCart)
        }

        res.send({
            displayCarts
        });
    } catch ({ name, message }) {
      next({ name, message });
    }
});

//---mounts get route for get cart by logged in cust (see my cart function) - returns cart with all details---
cartRouter.get('/mycart/', requireUser, async (req, res, next) => {
    try {
        const cart = await cartBuilder(req.user.id);

        res.send({
        cart
        });
    } catch ({ name, message }) {
      next({ name, message });
    }
});

//---mounts get route for cart by cust id (Admin Function) - returns cart with all details---
cartRouter.get('/customer/:custId', async (req, res, next) => {
    const {custId} = req.params
    try {
        const cart = await cartBuilder(custId);

        res.send({
        cart
        });
    } catch ({ name, message }) {
      next({ name, message });
    }
});

//---mounts update route for customer's cart (cust adding removing items etc)---
cartRouter.patch('/mycart/update', requireUser, async (req, res, next) => {
    const { cart_id, inventory_id, quantity } = req.body;
    
    try {
        const custCart = await cartBuilder(req.user.id);
      if (custCart.customer_id == req.user.id||req.user.role == "admin") {
        
        userCartId = custCart.id
        userCustId = custCart.customer_id 
        const cartProducts = await getCartProductsByCartId(cart_id);
        let productToUpdate = cartProducts.find(o => o.inventory_id == inventory_id);

        if (quantity == 0){
            const destroyed = await destroyCartProducts(cart_id, inventory_id, quantity)
            res.send({destroyed: destroyed})
        } else if (!productToUpdate){
          if (cart_id != custCart.id){
            throw new RouteError({
              status: 200,
              name: "NoAdminFunction",
              message: "Only users can add to their own cart"
            });
          } else {
            const body = {
              customer_id: req.user.id,
              quantity: quantity,
              product: {
                  id: inventory_id
              }
            }
            const updated = await addToCart(body)
            res.send({updated: updated})
          }

        } else if (quantity == productToUpdate.quantity){
            throw new RouteError({
                status: 200,
                name: "NoUpdateError",
                message: "No Update Found"
              });
        } else if (quantity != productToUpdate.quantity){
            const updated = await updateCartProducts(cart_id, inventory_id, quantity )
            res.send({updated: updated})
        }
        
        
  
      } else {
        res.status(401);
        throw new RouteError({
          name: 'UnauthorizedUserError',
          message: 'You cannot update a cart that is not yours'
        })
      }

    } catch (error) {
      next(error);
    }
});


module.exports = cartRouter