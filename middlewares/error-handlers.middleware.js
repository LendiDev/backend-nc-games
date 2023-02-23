const CustomError = require("../utils/custom-error");

const notFoundErrorHandler = (req, res, next) => {
  const error = new CustomError(404, `${req.method} ${req.path} not found`);
  next(error);
};

const customErrorHandler = (err, req, res, next) => {
  if (err.statusCode && err.message) {
    res.status(err.statusCode).send({ message: err.message });
  } else next(err);
};

const psqlErrorHandler = (err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23502" || err.code === "23503") {
    res.status(400).send({ message: "Bad request" });
  } else {
    next(err);
  }
};

const internalErrorHandler = (err, req, res, next) => {
  if (err.code) console.log("Unhandled PSQL ERROR: ", err);
  else console.log("Unhandled Error: ", err);
  res.status(500).send({ message: "Internal Server Error" });
};

module.exports = {
  notFoundErrorHandler,
  customErrorHandler,
  psqlErrorHandler,
  internalErrorHandler,
};
