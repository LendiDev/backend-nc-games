class CustomError {
  constructor(statusCode, message) {
    this.statusCode = statusCode || 501;
    this.message = message || 'Not Implemented';
  }
}

module.exports = CustomError;