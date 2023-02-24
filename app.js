const express = require("express");
const cors = require("cors");
const {
  notFoundErrorHandler,
  customErrorHandler,
  psqlErrorHandler,
  internalErrorHandler,
} = require("./middlewares/error-handlers.middleware");
const apiRouter = require("./routers/api.router");
const { redirectToEndpoints } = require("./controllers/api.controller");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", redirectToEndpoints);
app.use("/api", apiRouter);

app.all("*", notFoundErrorHandler);
app.use(customErrorHandler, psqlErrorHandler, internalErrorHandler);

module.exports = app;
