const express = require('express');
const apiRouter = express.Router();
const jwt = require('jsonwebtoken');
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const { RouteError } = require("./utils")

const { getCustomerById } = require('../db');


apiRouter.use(async (req, res, next) => {
  const auth = req.cookies.jwtCust

  if (auth == undefined) {
    next();
  } else if (auth) {
    try {
      const { id } = jwt.verify(auth, JWT_SECRET);
      if (id) {
        req.user = await getCustomerById(id);
        console.log("setting user to: " + req.user.username)
        next();
      } else {
        next({
          name: 'AuthorizationHeaderError',
          message: 'Authorization token malformed',
        });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: 'NoAuthTokenFound',
      message: `Please Login`,
    });
  }
});

//---mounts /auth route---
const authRouter = require('./auth');
apiRouter.use('/auth', authRouter);

//---mounts /customer route---
const customersRouter = require('./customers');
apiRouter.use('/customers', customersRouter);

//---mounts /cart route---
const cartsRouter = require('./cart');
apiRouter.use('/carts', cartsRouter);

const inventoryRouter= require('./inventory');
apiRouter.use('/inventory', inventoryRouter);

apiRouter.all('*', (req, res) => {
  throw new RouteError({
    status: 404,
    name: "APIRouteNotFound",
    message: "Oops! Route not Found"
  });
})

//---mounts error handler middleware---
const { errorHandler } = require("./utils")
apiRouter.use(errorHandler)

module.exports = apiRouter;