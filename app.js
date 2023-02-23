const express = require("express");
const {
  notFoundErrorHandler,
  customErrorHandler,
  psqlErrorHandler,
  internalErrorHandler,
} = require("./middlewares/error-handlers.middleware");
const apiRouter = require("./routers/api.router");

const app = express();

app.use(express.json());

app.use('/api', apiRouter);

app.all("/*", notFoundErrorHandler);
app.use(customErrorHandler, psqlErrorHandler, internalErrorHandler);

module.exports = app;
