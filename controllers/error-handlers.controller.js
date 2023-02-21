const notFoundErrorsHandler = (req, res, next) => {
  res.status(404).send({ message: "Not Found" });
};

const customErrorsHandler = (err, req, res, next) => {
  if (err.statusCode && err.message) {
    res.status(err.statusCode).send({ message: err.message });
  } else next(err);
};

const psqlErrorsHandler = (err, req, res, next) => {
  // TODO: add extra logical errors by codes
  if (err.code) console.log("PSQL ERROR: ", err);
  if (err.code === '22P02') {
    res.status(400).send({ message: "Bad request" });
  } else next(err);
};

const internalErrorsHandler = (err, req, res) => {
  res.status(500).send({ message: "Internal Server Error" });
};

module.exports = {
  notFoundErrorsHandler,
  customErrorsHandler,
  psqlErrorsHandler,
  internalErrorsHandler,
};
