const express = require('express');
const customersRouter = express.Router();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
require("dotenv").config();
const bcrypt = require("bcrypt");
const { requireUser, RouteError } = require("./utils")
const { getAllCustomers, getCustomerById, getCustByUsername, createCustomer, updateCustomer, getAddressByID, createAddress, updateAddress, destroyCustomer, destroyAddress, getCartByCustId, destroyCartProductsU, destroyCart } = require('../db');

//---mounts get all customers route - returns all customers w/address---
customersRouter.get('/', requireUser, async (req, res, next) => {
  try {
    if (req.user.role == "admin") {
      const customers = await getAllCustomers();

      await Promise.all(customers.map(async customer => {
        const address = await getAddressByID(customer.id)
        customer.address = address
      }))

      res.send({
        customers
      });
    } else {
      throw new RouteError({
        status: 401,
        name: "Unauthorized",
        message: "You are not authorized to view all carts"
      });
    }
  }
  catch ({ name, message }) {
    next({ name, message });
  }
});

//---mounts get customer by id param route - returns single customer w/address---
customersRouter.get('/:custId', async (req, res, next) => {
  const { custId } = req.params
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
  } catch (error) {
    next(error);
  }
});

//---mounts register new customer route - accepts customer & address object---
customersRouter.post('/register', async (req, res, next) => {
  const { username, password, email, firstname, lastname, phone_number, role, address } = req.body;


  try {
    if (!username ||
      !password ||
      !email ||
      !firstname ||
      !lastname ||
      !phone_number ||
      !role) {
      throw new RouteError({
        name: "MissingCustomerDataError",
        message: "Required Field - username, password, email, firstname, lastname, phone_number"
      })
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

    //---check for existing customer---
    const existingUserName = username
    const existingUserEmail = email
    const customers = await getAllCustomers()
    const eCu = customers.find(({ username }) => username === existingUserName);
    const eCe = customers.find(({ email }) => email === existingUserEmail);

    if (eCu || eCe) {
      throw new RouteError({
        name: "CustomerAlreadyExists",
        message: "A customer with this username or email already exists"
      })
    }
    const cust = await createCustomer({
      username,
      password,
      email,
      firstname,
      lastname,
      phone_number,
      role,
    });

    const custAddress = await createAddress({
      customer_id: cust.id,
      street_number: address.street_number,
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip
    });

    cust.address = custAddress

    if (cust) {
      res.send({
        message: "Registration Succesful!",
        cust
      });
    } else {
      throw new RouteError({
        name: "RegistrationUnsuccesful",
        message: "Please reach out to customer service!"
      })
    }
  } catch (error) {
    next(error);
  }
});

//---mounts update customer route - returns updated customer---
customersRouter.patch('/:custId', requireUser, async (req, res, next) => {
  try {
    const { custId } = req.params

    const {
      username,
      password,
      email,
      firstname,
      lastname,
      phone_number,
      role
    } = req.body;

    const custFields = {};

    if (username) {
      custFields.username = username;
    }
    if (password) {
      custFields.password = password;
    }
    if (email) {
      custFields.email = email;
    }
    if (firstname) {
      custFields.firstname = firstname;
    }
    if (lastname) {
      custFields.lastname = lastname;
    }
    if (phone_number) {
      custFields.phone_number = phone_number;
    }
    if (role) {
      custFields.role = role;
    }

    if (Object.keys(custFields).length > 0) {
      const originalCust = await getCustomerById(custId);
      if (role) {
        res.status(200);
        throw new RouteError({
          name: 'UpdateRoleError',
          message: 'Admin functionality has not been created yet'
        })
      }

      if (originalCust.id === req.user.id || req.user.role == "admin") {
        const updatedCust = await updateCustomer(custId, custFields)
        res.send({ customer: updatedCust })

      } else {
        res.status(401);
        throw new RouteError({
          name: 'UnauthorizedUserError',
          message: 'You cannot update a customer that is not yours'
        })
      }
    } else {
      res.status(401);
      throw new RouteError({
        name: 'NoUpdateFound',
        message: 'There is nothing to update'
      })
    }


  } catch (error) {
    next(error);
  }
});

//---mounts update customer address route - returns updated address---
customersRouter.patch('/:custId/address', requireUser, async (req, res, next) => {
  try {
    const { custId } = req.params
    const originalCust = await getCustomerById(custId);

    const {
      street_number,
      street,
      city,
      state,
      zip
    } = req.body;

    const addressFields = {};

    if (street_number) {
      addressFields.street_number = street_number;
    }
    if (street) {
      addressFields.street = street;
    }
    if (city) {
      addressFields.city = city;
    }
    if (state) {
      addressFields.state = state;
    }
    if (zip) {
      addressFields.zip = zip;
    }

    if (Object.keys(addressFields).length > 0) {

      if (originalCust.id === req.user.id || req.user.role == "admin") {
        const updatedAddress = await updateAddress(custId, addressFields)
        res.send({ address: updatedAddress })

      } else {
        res.status(401);
        throw new RouteError({
          name: 'UnauthorizedUserError',
          message: 'You cannot update an address that is not yours'
        })
      }
    } else {
      res.status(401);
      throw new RouteError({
        name: 'NoUpdateFound',
        message: 'There is nothing to update'
      })
    }

  } catch (error) {
    next(error);
  }
});


customersRouter.delete('/:custId', requireUser, async (req, res, next) => {
  const { custId } = req.params

  try {
    if (req.user.role == "admin") {
      const custCart = await getCartByCustId(custId)
      const responObj = {}
      if (custCart[0]) {
        const deletedCartProducts = await destroyCartProductsU(custCart[0].id)
        const deletedCart = await destroyCart(custId)
        responObj.DeletedCart = deletedCart
      }
      const deletedAddress = await destroyAddress(custId)
      const deletedCust = await destroyCustomer(custId);
      responObj.deletedAddress = deletedAddress
      responObj.deletedCust = deletedCust
      res.send(
        responObj
      )
    } else {
      throw new RouteError({
        status: 401,
        name: "Unauthorized",
        message: "You are not authorized to view all carts"
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = customersRouter;