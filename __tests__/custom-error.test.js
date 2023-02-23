const CustomError = require('../utils/custom-error');

describe('CustomError', () => {
  test('should have by default 501 status code and message Not Implemented', () => {
    const error = new CustomError();
    expect(error).toHaveProperty('statusCode', 501);
    expect(error).toHaveProperty('message', 'Not Implemented');
  })

  test('should have status code and message on declaration with them', () => {
    const error = new CustomError(404, 'Not Found');
    expect(error).toHaveProperty('statusCode', 404);
    expect(error).toHaveProperty('message', 'Not Found');
  });
});
