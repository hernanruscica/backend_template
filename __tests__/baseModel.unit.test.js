import { jest } from '@jest/globals';

// Mock del pool antes de importar BaseModel
jest.unstable_mockModule('../src/config/database.js', () => ({
  default: { query: jest.fn() },
}));

const { default: pool } = await import('../src/config/database.js');
const { default: BaseModel } = await import('../src/models/baseModel.js');

describe('BaseModel (unit)', () => {
  const Model = BaseModel('things', ['name', 'description', 'business_uuid']);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('findAll devuelve filas', async () => {
    pool.query.mockResolvedValueOnce([[{ uuid: 't1', name: 'Thing' }]]);
    const rows = await Model.findAll();
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM things');
    expect(rows).toEqual([{ uuid: 't1', name: 'Thing' }]);
  });

  it('findByUuid devuelve item', async () => {
    pool.query.mockResolvedValueOnce([[{ uuid: 't1', name: 'Thing' }]]);
    const item = await Model.findByUuid('t1');
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM things WHERE uuid = ?', ['t1']);
    expect(item).toEqual({ uuid: 't1', name: 'Thing' });
  });

  it('create inserta mapeando camelCase y agrega created_by', async () => {
    // 1) INSERT ok
    pool.query.mockResolvedValueOnce([{}]);
    // 2) SELECT by uuid
    pool.query.mockResolvedValueOnce([[{ uuid: 'generated-uuid', name: 'N', business_uuid: 'b1' }]]);

    const data = { name: 'N', business_uuid: 'b1', ignored: 'X' };
    const result = await Model.create(data, 'creator-uuid');

    // Primera llamada: INSERT ... VALUES (?, ?, ...)
    expect(pool.query.mock.calls[0][0]).toMatch(/^INSERT INTO things \(/);
    expect(pool.query.mock.calls[0][1]).toEqual(expect.arrayContaining(['creator-uuid']));

    // Segunda llamada: SELECT por uuid
    expect(pool.query.mock.calls[1][0]).toBe('SELECT * FROM things WHERE uuid = ?');
    expect(result).toEqual({ uuid: 'generated-uuid', name: 'N', business_uuid: 'b1' });
  });

  it('create lanza CustomError en ER_DUP_ENTRY', async () => {
    pool.query.mockRejectedValueOnce({ code: 'ER_DUP_ENTRY' });
    await expect(Model.create({ name: 'N', business_uuid: 'b1' }, 'u1')).rejects.toThrow(/already exists/i);
  });

  it('update ignora campos no permitidos y agrega updated_by', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    await Model.update('t1', { name: 'Nuevo', notAllowed: 'x' }, 'upd-uuid');
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE things SET name = ?, updated_by = ? WHERE uuid = ?',
      ['Nuevo', 'upd-uuid', 't1']
    );
  });

  it('delete hace soft delete y setea updated_by', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    await Model.delete('t1', 'upd-uuid');
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE things SET is_active = false, updated_by = ? WHERE uuid = ?',
      ['upd-uuid', 't1']
    );
  });

  it('hardDelete mapea ER_ROW_IS_REFERENCED_2 a CustomError 409', async () => {
    pool.query.mockRejectedValueOnce({ code: 'ER_ROW_IS_REFERENCED_2' });
    await expect(Model.hardDelete('t1')).rejects.toThrow(/cannot be deleted/i);
  });
});


