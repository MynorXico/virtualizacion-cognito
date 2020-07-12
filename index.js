"use strict";
const dotenv = require("dotenv");
var cors = require('cors')
var express = require('express');
dotenv.config();
var path = require("path");
var http = require("http");
const bearerToken = require('express-bearer-token');
var oas3Tools = require("oas3-tools");
var serverPort = process.env.PORT;

// swaggerRouter configuration
var options = {
  controllers: path.join(__dirname, "./controllers"),
};

var expressAppConfig = oas3Tools.expressAppConfig(
  path.join(__dirname, "api/openapi.yaml"),
  options
);
expressAppConfig.addValidator();
var app = expressAppConfig.getApp();
app.use(bearerToken())
app.use(cors());

// Add headers
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

var routes = require('./routes');


// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, "0.0.0.0", function () {
  var defaultRouter = express.Router();
  defaultRouter.get('/', (req, res) => {res.send({"api": "identity"})})
  app.use('/', defaultRouter);
  app.use(bearerToken())
  app.use('/users/', routes);
  console.log(
    "Your server is listening on port %d (http://localhost:%d)",
    serverPort,
    serverPort
  );
  console.log(
    "Swagger-ui is available on http://localhost:%d/docs",
    serverPort
  );
});
