const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
// const { createUser, getUserByUsername, getPublicRoutinesByUser, getAllRoutinesByUser, getUser } = require('../db');
// const { requireUser } = require('./utils');
const { JWT_SECRET = 'neverTell' } = process.env;