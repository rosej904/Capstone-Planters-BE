const express = require('express');
const cartsRouter = express.Router();
require("dotenv").config();
const { requireUser, RouteError } = require("./utils")
const { getAllCarts, cartBuilder, getCartProductsByCartId, destroyCartProducts, updateCartProducts, addToCart, addCartProducts, updateCartPrice, getCartByCustId, updateCart, createOrder, createOrderProducts } = require('../db');

//---mounts get all carts (admin function) - returns all carts with details---
cartsRouter.get('/all', requireUser, async (req, res, next) => {
  if (req.user.role == "admin") {
    try {
      const carts = await getAllCarts()
      let displayCarts = []
      for (i of carts) {
        const unconvertedCarts = await cartBuilder(i.id, "cart", false)
        const convertedCarts = await cartBuilder(i.id, "cart", true)
        displayCarts.push(unconvertedCarts)
        displayCarts.push(convertedCarts)
      }

      res.send({
        displayCarts
      });
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    throw new RouteError({
      status: 401,
      name: "Unauthorized",
      message: "You are not authorized to view all carts"
    });
  }
});

//---mounts get route for get cart by logged in cust (see my cart function) - returns cart with all details---
cartsRouter.get('/mycart/', requireUser, async (req, res, next) => {
  try {
    const cart = await cartBuilder(req.user.id, "cust", false);

    res.send({
      cart
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

//---mounts get route for cart by cust id (Admin Function) - returns cart with all details---
cartsRouter.get('/customer/:custId', requireUser, async (req, res, next) => {
  const { custId } = req.params
  if (req.user.role == "admin") {
    try {
      const cart = await cartBuilder(custId, "cust", false);

      res.send({
        cart
      });
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    throw new RouteError({
      status: 401,
      name: "Unauthorized",
      message: "You must be admin to view all carts"
    });
  }
});

//---mounts update route for customer's cart (cust adding removing items etc)---
cartsRouter.patch('/mycart/update', requireUser, async (req, res, next) => {
  const { inventory_id, quantity } = req.body;
  let displayCart = {}
  try {
    const existingCart = await getCartByCustId(req.user.id, false)
    if (existingCart) {
      const invId = inventory_id
      const existingCartProducts = await getCartProductsByCartId(existingCart.id)
      const cartProductUpdate = existingCartProducts.find(({ inventory_id }) => inventory_id == invId);
      if (!cartProductUpdate) {
        await addCartProducts(existingCart.id, inventory_id, quantity)
      } else if (cartProductUpdate && quantity == 0) {
        destroyCartProducts(existingCart.id, inventory_id)
      } else if (cartProductUpdate && quantity != cartProductUpdate.quantity) {
        updateCartProducts(existingCart.id, inventory_id, quantity)
      }
      await updateCartPrice(existingCart.id)
      displayCart = await cartBuilder(existingCart.id, "cart", false)
    } else {
      const returnCart = await addToCart(req.user.id);
      await addCartProducts(returnCart.id, inventory_id, quantity)
      await updateCartPrice(returnCart.id)
      displayCart = await cartBuilder(returnCart.id, "cart", false)
    }
    res.send(displayCart)
  } catch (error) {
    next(error);
  }
});

//---mounts checkout route for customer's cart---
cartsRouter.patch('/mycart/checkout', requireUser, async (req, res, next) => {
  try {
    const custCart = await getCartByCustId(req.user.id, false)
    if (custCart && custCart.total_price != 0) {
      await updateCart(custCart.id, { "converted": true })
      const checkedOutCart = await cartBuilder(custCart.id, "cart", true)

      //---adds cart to order tables---
      const order = await createOrder({
        cart_id: checkedOutCart.id,
        customer_id: checkedOutCart.customer_id,
        total_price: checkedOutCart.total_price
      })

      for (i of checkedOutCart.items) {
        await createOrderProducts({
          order_id: order.id,
          inventory_id: i.id,
          quantity: i.quantity
        })
      }
      res.send(checkedOutCart)
    } else {
      res.status(200);
      throw new RouteError({
        name: 'NoPendingCart',
        message: 'There is no pending cart to checkout'
      })
    }
  } catch (error) {
    next(error);
  }
});


module.exports = cartsRouter