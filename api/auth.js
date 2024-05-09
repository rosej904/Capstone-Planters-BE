const express = require('express');
const authRouter = express.Router();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const { requireUser, RouteError } = require("./utils")
const { getCustomerById } = require('../db');

authRouter.get('/', async (req, res, next) => {
  

  // const auth = req.cookies.jwtCust
  const auth = req.header('x-jwtCust');
    if (auth == undefined||null) {
      console.log(auth + "null from auth")
      // next()
      res.send({name: "NoAuth", message:"NoAuth"})
    } else if (auth) {
      console.log(auth + "not null from auth")
      try {
        const { id } = jwt.verify(auth, JWT_SECRET);
        if (id) {
          const userAuth = await getCustomerById(id);
          let isAdmin = false
          if (userAuth.role == "admin"){isAdmin = true}
          res.send({
            custId: userAuth.id,
            username: userAuth.username,
            role: userAuth.role,
            isAdmin: isAdmin
          })
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
  })

  module.exports = authRouter;