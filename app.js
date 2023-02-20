const express = require("express");
const {
  notFoundErrorsHandler,
  customErrorsHandler,
  psqlErrorsHandler,
  internalErrorsHandler,
} = require("./controllers/error-handlers.controller");
const categoriesRouter = require("./routers/categories.router");

const app = express();

app.use('/api/categories/', categoriesRouter);

app.use(
  notFoundErrorsHandler,
  customErrorsHandler,
  psqlErrorsHandler,
  internalErrorsHandler
);

module.exports = app;
