import { jest } from '@jest/globals';
import { permissionMiddleware } from '../src/middlewares/permissionMiddleware.js';

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createReq = ({ method = 'GET', baseUrl = '/api/users', routePath = '/', body = {}, params = {}, user = {} } = {}) => ({
  method,
  baseUrl,
  route: { path: routePath },
  body,
  params,
  user,
});

describe('permissionMiddleware (unit)', () => {
  const ownerUser = {
    uuid: 'owner-uuid',
    roles: [],
    isOwner: true,
  };

  const adminUser = {
    uuid: 'admin-uuid',
    roles: [
      { role: 'Administrator', businessUuid: 'biz-1', businessName: 'Biz 1' },
    ],
    isOwner: false,
  };

  const techUser = {
    uuid: 'tech-uuid',
    roles: [
      { role: 'Technician', businessUuid: 'biz-1', businessName: 'Biz 1' },
    ],
    isOwner: false,
  };

  it('permite acceso inmediato si el usuario es Owner', async () => {
    const req = createReq({
      method: 'DELETE',
      baseUrl: '/api/products',
      routePath: '/hard',
      body: {},
      params: {},
      user: ownerUser,
    });
    const res = createMockRes();
    const next = jest.fn();

    await permissionMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('rechaza si falta uuidOrigin', async () => {
    const req = createReq({
      method: 'GET',
      baseUrl: '/api/users',
      user: adminUser,
    });
    const res = createMockRes();
    const next = jest.fn();

    await permissionMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "'uuidOrigin' atribute required on body" });
    expect(next).not.toHaveBeenCalled();
  });

  it('permite a Administrator realizar POST en users del mismo negocio', async () => {
    const req = createReq({
      method: 'POST',
      baseUrl: '/api/users',
      body: { uuidOrigin: 'biz-1' },
      user: adminUser,
    });
    const res = createMockRes();
    const next = jest.fn();

    await permissionMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('rechaza acceso si el usuario no pertenece al negocio del uuidOrigin', async () => {
    const req = createReq({
      method: 'GET',
      baseUrl: '/api/businesses',
      body: { uuidOrigin: 'biz-2' },
      user: adminUser,
    });
    const res = createMockRes();
    const next = jest.fn();

    await permissionMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User dont belongs to the business' });
  });

  it('permite GET de Technician en products', async () => {
    const req = createReq({
      method: 'GET',
      baseUrl: '/api/products',
      body: { uuidOrigin: 'biz-1' },
      user: techUser,
    });
    const res = createMockRes();
    const next = jest.fn();

    await permissionMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('rechaza DELETE de Technician en users', async () => {
    const req = createReq({
      method: 'DELETE',
      baseUrl: '/api/users',
      body: { uuidOrigin: 'biz-1' },
      user: techUser,
    });
    const res = createMockRes();
    const next = jest.fn();

    await permissionMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Forbiben' });
  });
});
