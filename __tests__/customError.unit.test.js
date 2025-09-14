import CustomError from '../src/utils/customError.js';

describe('CustomError (unit)', () => {
  it('conserva mensaje y statusCode', () => {
    const err = new CustomError('Not Found', 404);
    expect(err.message).toBe('Not Found');
    expect(err.statusCode).toBe(404);
    expect(err.name).toBe('CustomError');
  });
});
