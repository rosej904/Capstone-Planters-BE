const { PORT = 3000 } = process.env;
const express = require('express');
const server = express();

const bodyParser = require('body-parser');
server.use(bodyParser.json());

const apiRouter = require('./api');
server.use('/api', apiRouter);

const client  = require('./db/client');
client.connect();

server.listen(PORT, () => {
  console.log("The server is up on port", PORT);
});