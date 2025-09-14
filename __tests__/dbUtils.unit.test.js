import { jest } from '@jest/globals';
import * as dbUtils from '../src/utils/dbUtils.js';
import bcrypt from 'bcryptjs';

describe('dbUtils.hashPassword (unit)', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {}); // silenciar logs
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('genera un hash usando bcrypt', async () => {
    jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt');
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed');

    const result = await dbUtils.hashPassword('secret');

    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('secret', 'salt');
    expect(result).toBe('hashed');
  });
});


