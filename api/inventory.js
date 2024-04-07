const express = require('express');
const router = express.Router();

const { getAllInventory,
    getInventoryById,
    createInventory,
    updateInventory,
    deleteInventory } = require('../db/inventory');

    //GET - /api/inventory - get all
    router.get('/', async (req, res, next) => {
        try {
            const products = await getAllInventory();
            res.send(products);
        } catch (error) {
            next(error);
        }
    });  