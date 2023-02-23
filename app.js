const express = require("express");
const {
  notFoundErrorsHandler,
  customErrorsHandler,
  psqlErrorsHandler,
  internalErrorsHandler,
} = require("./controllers/error-handlers.controller");
const categoriesRouter = require("./routers/categories.router");
const commentsRouter = require("./routers/comments.router");
const reviewsRouter = require("./routers/reviews.router");
const usersRouter = require("./routers/users.router");

const app = express();

app.use(express.json());

app.use('/api/categories', categoriesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/users', usersRouter);

app.use(
  notFoundErrorsHandler,
  customErrorsHandler,
  psqlErrorsHandler,
  internalErrorsHandler
);

module.exports = app;
