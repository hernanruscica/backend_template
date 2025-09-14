import { jest } from '@jest/globals';
import errorHandler from '../src/middlewares/errorHandler.js';
import CustomError from '../src/utils/customError.js';

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('errorHandler (unit)', () => {
  const req = {};
  const next = jest.fn();

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('responde con status y mensaje de CustomError', () => {
    const err = new CustomError('Not Found', 404);
    const res = createRes();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not Found' });
  });

  it('responde 500 con mensaje del error genérico', () => {
    const err = new Error('Boom');
    const res = createRes();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Boom' });
  });

  it('si el error no tiene message, responde 500 con mensaje por defecto', () => {
    const err = {};
    const res = createRes();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Internal Server Error' });
  });
});


