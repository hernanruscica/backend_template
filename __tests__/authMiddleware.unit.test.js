import { jest } from '@jest/globals';
import { authMiddleware } from '../src/middlewares/authMiddleware.js';
import jwt from 'jsonwebtoken';

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authMiddleware (unit)', () => {
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna 401 si no hay token', () => {
    const req = { headers: {} };
    const res = createRes();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 401 si el token es inválido', () => {
    const req = { headers: { authorization: 'Bearer badtoken' } };
    const res = createRes();

    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('bad');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('setea req.user y llama next con token válido', () => {
    const req = { headers: { authorization: 'Bearer goodtoken' } };
    const res = createRes();
    const decoded = { uuid: 'user-1' };

    jest.spyOn(jwt, 'verify').mockReturnValue(decoded);

    authMiddleware(req, res, next);

    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalled();
  });
});


