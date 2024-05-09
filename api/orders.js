const express = require('express');
const orderRouter = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET = 'neverTell' } = process.env;
const {getOrderById} = require('../db');

//---mounts get route for order by order id - returns order with all details---
orderRouter.get('/:orderId', async (req, res, next) => {
    const {orderId} = req.params
    try {
        const order = await getOrderById(orderId)

        res.send({
        order
        });
    } catch ({ name, message }) {
        next({ name, message });
    }
});

module.exports = orderRouter