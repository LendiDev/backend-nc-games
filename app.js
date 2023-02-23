const express = require("express");
const {
  notFoundErrorHandler,
  customErrorHandler,
  psqlErrorHandler,
  internalErrorHandler,
} = require("./middlewares/error-handlers.middleware");
const { getEndpoints } = require("./controllers/api.controller");
const categoriesRouter = require("./routers/categories.router");
const commentsRouter = require("./routers/comments.router");
const reviewsRouter = require("./routers/reviews.router");
const usersRouter = require("./routers/users.router");

const app = express();

app.use(express.json());

app.get("/api", getEndpoints);
app.use('/api/categories', categoriesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/users', usersRouter);

app.all("/*", notFoundErrorHandler);
app.use(customErrorHandler, psqlErrorHandler, internalErrorHandler);

module.exports = app;
