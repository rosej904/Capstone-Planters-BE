const express = require('express');
const inventoryRouter = express.Router();

const { getAllInventory,
    getInventoryById,
    createInventory,
    updateInventory,
    deleteInventory } = require('../db/inventory');
const { requireUser, RouteError } = require('./utils');

    //GET - /api/inventory - get all
    inventoryRouter.get('/', async (req, res, next) => {
        try {
            const products = await getAllInventory();
            res.send(products);
        } catch (error) {
            next(error);
        }
    });  

    // GET - /api/inventory/:id - get a single product by id
inventoryRouter.get('/:id', async (req, res, next) => {
    try {
        const productId = req.params.id;
        const product = await getInventoryById(productId);
        res.send(product);
    } catch (error) {
        next(error);
    }
});

// POST - /api/inventory - create a new product
inventoryRouter.post('/', requireUser, async (req, res, next) => {
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
          message: "You are not authorized to add new products."
        });
    }
});

// PUT - /api/inventory/:id - update a product by id
inventoryRouter.put('/:id', requireUser, async (req, res, next) => {
    if (req.user.role == "admin") {
        try {
            const product = await updateInventory(req.params.id, req.body);
            res.send(product);
        } catch (error) {
            next(error);
        }
    } else {
        throw new RouteError({
          status: 401,
          name: "Unauthorized",
          message: "You are not authorized to update products"
        });
    }
});

// DELETE - /api/inventory/:id - delete a single product by id
inventoryRouter.delete('/:id', async (req, res, next) => {
    if (req.user.role == "admin") {
        try {
            const product = await deleteInventory(req.params.id);
            res.send(product);
        } catch (error) {
            next(error);
        }
    } else {
        throw new RouteError({
          status: 401,
          name: "Unauthorized",
          message: "You are not authorized to delete products"
        });
    }
});

module.exports = inventoryRouter