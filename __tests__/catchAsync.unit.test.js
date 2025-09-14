import { jest } from '@jest/globals';
import catchAsync from '../src/utils/catchAsync.js';

const createRes = () => ({ status: jest.fn().mockReturnValue({}), json: jest.fn() });

describe('catchAsync (unit)', () => {
  it('llama next con error cuando la promesa rechaza', async () => {
    const error = new Error('boom');
    const asyncFn = jest.fn().mockRejectedValue(error);
    const wrapped = catchAsync(asyncFn);

    const req = {};
    const res = createRes();
    const next = jest.fn();

    await wrapped(req, res, next);

    expect(asyncFn).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('propaga next cuando la promesa resuelve', async () => {
    const asyncFn = jest.fn().mockResolvedValue(undefined);
    const wrapped = catchAsync(asyncFn);

    const req = {};
    const res = createRes();
    const next = jest.fn();

    await wrapped(req, res, next);

    expect(asyncFn).toHaveBeenCalledWith(req, res, next);
    // cuando resuelve, no se llama next con error; simplemente terminó
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });
});


