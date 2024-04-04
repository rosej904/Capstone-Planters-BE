const express = require('express');
const customersRouter = express.Router();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
require("dotenv").config();
const bcrypt = require("bcrypt");
const {requireUser, RouteError} = require("./utils")
const { getAllCustomers, getCustomerById, getCustByUsername, createCustomer, updateCustomer, getAddressByID } = require('../db');

//---mounts get all customers route - returns all customers w/address---
customersRouter.get('/', async (req, res, next) => {
    try {
      const customers = await getAllCustomers();

      await Promise.all(customers.map(async customer => {
        const address = await getAddressByID(customer.id)
        customer.address = address
    }))
    
      res.send({
        customers
      });
    } catch ({ name, message }) {
      next({ name, message });
    }
});

//---mounts get customer by id param route - returns single customer w/address---
customersRouter.get('/:custId', async (req, res, next) => {
    const {custId} = req.params
    try {
        const customer = await getCustomerById(custId);
        const address = await getAddressByID(customer.id)
        customer.address = address


        res.send({
        customer
        });
    } catch ({ name, message }) {
      next({ name, message });
    }
});

//---mounts - customers login route - accepts object username&pw and returns object with token---
customersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
  
    try {
      if (!username || !password) {
        throw new RouteError({
          name: "MissingCredentialsError",
          message: "Please supply both a username and password"
        });
      }

      const cust = await getCustByUsername(username);
      if (cust && await bcrypt.compare(password, cust.password)) {
        let userId = cust.id
        const token = jwt.sign({ 
          id: cust.id,
          role: cust.role,
          username: cust.username
        }, JWT_SECRET, {
          expiresIn: '1w'
        });
  
        res.send({ 
          message: "Login Succesful!",
          userId,
          token
        });
      } else {
        throw new RouteError({
          status: 401,
          name: "LoginError",
          message: "Login Unsuccesful - Username or Password incorrect!"
        });
      }
    } catch(error) {
      next(error);
    }
});

//---mounts register new customer route - accepts object username&pw and returns object with token---
customersRouter.post('/register', async (req, res, next) => {
  const { username, password, email, firstname, lastname, phone_number, role, address } = req.body;

  try {
    if (!username || 
      !password || 
      !email || 
      !firstname || 
      !lastname || 
      !phone_number||
      !role) {
      throw new RouteError({
        name: "MissingCustomerDataError",
        message: "Required Field - username, password, email, firstname, lastname, phone_number"
      })

      // throw error
    }

    if (
      !address.street_number ||
      !address.street ||
      !address.city ||
      !address.state ||
      !address.zip) {
      throw new RouteError({
        name: "MissingAddressDataError",
        message: "Required Field - street number, street, city, state, zip"
      });
    }
    const cust = await createCustomer({ 
      username, 
      password, 
      email, 
      firstname, 
      lastname, 
      phone_number, 
      role, 
      address });

    if (cust) {
      res.send({ 
        message: "Registration Succesful!",
        cust
      });
    } else {
      res.send({ 
        message: "Registration Unsuccesful",
      });
    }
  } catch(error) {
    next(error);
  }
});

//---mounts update customer route - accepts object username&pw and returns object with token---
customersRouter.patch('/:custId', requireUser, async (req, res, next) => {
  try {
    const {custId} = req.params

  const {
      username, 
      password, 
      email, 
      firstname, 
      lastname, 
      phone_number, 
      role, 
      address
  } = req.body;

  const updateFields = {};

  if (username) {
    updateFields.username = username;
  }
  if (password) {
    updateFields.password = password;
  }
  if (email) {
    updateFields.email = email;
  }
  if (firstname) {
    updateFields.firstname = firstname;
  }
  if (lastname) {
    updateFields.lastname = lastname;
  }
  if (phone_number) {
    updateFields.phone_number = phone_number;
  }

  if (address) {
    res.status(200);
      throw new RouteError({
        name: 'UpdateAddressError',
        message: 'You cannot update an address from here'
    })
  }

  if (role) {
    res.status(200);
    throw new RouteError({
      name: 'UpdateRoleError',
      message: 'Admin functionality has not been created yet'
  })
  }
    const originalCust = await getCustomerById(custId);

    if (originalCust.id === req.user.id) {
      const updatedCust = await updateCustomer(custId, updateFields)
      res.send({ customer: updatedCust })

    } else {
      res.status(401);
      throw new RouteError({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a customer that is not yours'
      })
    }
  } catch (error) {
    next(error);
  }
});

customersRouter.delete('/:custId', requireUser, async (req, res, next) => {
    const {custId} = req.params
    const originalCust = await getCustomerById(custId);
    try {
    res.status(200);
    throw new RouteError({
        name: 'DeleteUserError',
        message: 'Admin functionality has not been created yet'
    })
    } catch (error) {
        next(error);
    }
  
  });

module.exports = customersRouter;