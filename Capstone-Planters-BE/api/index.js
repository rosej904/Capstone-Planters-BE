const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
// const { getUserById } = require('../db');
const client = require('../db/client');
const { JWT_SECRET = 'neverTell'} = process.env;