const express = require('express');
const router = express.Router();

const { getAllInventory,
    getInventoryById,
    createInventory,
    updateInventory,
    deleteInventory } = require('../db/inventory');
const { requireUser, RouteError } = require('./utils');

    //GET - /api/inventory - get all
    router.get('/', async (req, res, next) => {
        try {
            const products = await getAllInventory();
            res.send(products);
        } catch (error) {
            next(error);
        }
    });  

    // GET - /api/inventory/:id - get a single product by id
router.get('/:id', async (req, res, next) => {
    try {
        const productId = req.params.id;
        const product = await getInventoryById(productId);
        res.send(product);
    } catch (error) {
        next(error);
    }
});

// POST - /api/inventory - create a new product
router.patch('/', requireUser, async (req, res, next) => {
    if (req.user.role == "admin") {
        try {
            const product = await createInventory(req.body);
            res.send(product);
        } catch (error) {
            next(error);
        }
    } else {
        throw new RouteError({
          status: 401,
          name: "Unauthorized",
          message: "You are not authorized to view all carts"
        });
    }
});