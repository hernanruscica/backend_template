import { jest } from '@jest/globals';
import CustomError from '../src/utils/customError.js';

// Mock ESM del BusinessModel ANTES de importar BaseService
jest.unstable_mockModule('../src/models/businessModel.js', () => ({
  BusinessModel: {
    findByUuid: jest.fn(),
    findBusinessByUserId: jest.fn(),
  },
}));

const { BusinessModel } = await import('../src/models/businessModel.js');
const { default: BaseService } = await import('../src/services/baseService.js');

describe('BaseService (unit)', () => {
  const mockModel = {
    tableName: 'things',
    create: jest.fn(),
    findByUuid: jest.fn(),
    findAll: jest.fn(),
    findAllByBusinessUuid: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    hardDelete: jest.fn(),
  };

  const service = BaseService(mockModel);

  const userOwner = { uuid: 'owner-1', isOwner: true };
  const userMember = { uuid: 'user-1', isOwner: false };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('crea item cuando el negocio existe', async () => {
      BusinessModel.findByUuid.mockResolvedValue({ uuid: 'biz-1' });
      mockModel.create.mockResolvedValue({ uuid: 'item-1' });

      const data = { name: 'Test' };
      const result = await service.create(data, 'biz-1', userMember);

      expect(BusinessModel.findByUuid).toHaveBeenCalledWith('biz-1');
      expect(mockModel.create).toHaveBeenCalledWith({ ...data, business_uuid: 'biz-1' }, userMember.uuid);
      expect(result).toEqual({ uuid: 'item-1' });
    });

    it('lanza error si el negocio no existe', async () => {
      BusinessModel.findByUuid.mockResolvedValue(null);

      await expect(service.create({}, 'biz-404', userMember)).rejects.toThrow(CustomError);
    });
  });

  describe('getAll', () => {
    it('devuelve todos los items si es owner', async () => {
      mockModel.findAll.mockResolvedValue([{ uuid: 'x' }]);

      const items = await service.getAll(userOwner);

      expect(mockModel.findAll).toHaveBeenCalled();
      expect(items).toEqual([{ uuid: 'x' }]);
    });

    it('devuelve items del negocio del usuario si no es owner', async () => {
      BusinessModel.findBusinessByUserId.mockResolvedValue({ uuid: 'biz-1' });
      mockModel.findAllByBusinessUuid.mockResolvedValue([{ uuid: 'y' }]);

      const items = await service.getAll(userMember);

      expect(BusinessModel.findBusinessByUserId).toHaveBeenCalledWith('user-1');
      expect(mockModel.findAllByBusinessUuid).toHaveBeenCalledWith('biz-1');
      expect(items).toEqual([{ uuid: 'y' }]);
    });

    it('lanza error si el usuario no está asociado a un negocio', async () => {
      BusinessModel.findBusinessByUserId.mockResolvedValue(null);

      await expect(service.getAll(userMember)).rejects.toThrow('User is not associated with any business');
    });
  });

  describe('getByUuid', () => {
    it('devuelve el item si existe', async () => {
      mockModel.findByUuid.mockResolvedValue({ uuid: 'a' });
      const item = await service.getByUuid('a');
      expect(item).toEqual({ uuid: 'a' });
    });

    it('lanza error si no existe', async () => {
      mockModel.findByUuid.mockResolvedValue(undefined);
      await expect(service.getByUuid('missing')).rejects.toThrow('thing not found');
    });
  });

  describe('updateByUuid', () => {
    it('actualiza si existe', async () => {
      mockModel.findByUuid.mockResolvedValue({ uuid: 'a' });
      mockModel.update.mockResolvedValue({ affectedRows: 1 });
      mockModel.findByUuid
        .mockResolvedValueOnce({ uuid: 'a' })
        .mockResolvedValueOnce({ uuid: 'a', name: 'Updated' });

      const item = await service.updateByUuid('a', { name: 'Updated' }, userMember);
      expect(mockModel.update).toHaveBeenCalledWith('a', { name: 'Updated' }, userMember.uuid);
      expect(item).toEqual({ uuid: 'a', name: 'Updated' });
    });

    it('lanza error si no existe', async () => {
      mockModel.findByUuid.mockResolvedValue(undefined);
      await expect(service.updateByUuid('missing', {}, userMember)).rejects.toThrow('thing not found');
    });
  });

  describe('deleteByUuid', () => {
    it('hace soft delete si existe', async () => {
      mockModel.findByUuid.mockResolvedValue({ uuid: 'a' });
      mockModel.delete.mockResolvedValue({ affectedRows: 1 });

      const res = await service.deleteByUuid('a', userMember);
      expect(mockModel.delete).toHaveBeenCalledWith('a', userMember.uuid);
      expect(res.message).toContain('thing deleted successfully');
    });

    it('lanza error si no existe', async () => {
      mockModel.findByUuid.mockResolvedValue(undefined);
      await expect(service.deleteByUuid('missing', userMember)).rejects.toThrow('thing not found');
    });
  });

  describe('hardDeleteByUuid', () => {
    it('hace hard delete si existe', async () => {
      mockModel.findByUuid.mockResolvedValue({ uuid: 'a' });
      mockModel.hardDelete.mockResolvedValue({ affectedRows: 1 });

      const res = await service.hardDeleteByUuid('a');
      expect(mockModel.hardDelete).toHaveBeenCalledWith('a');
      expect(res.message).toContain('thing permanently deleted successfully');
    });

    it('lanza error si no existe', async () => {
      mockModel.findByUuid.mockResolvedValue(undefined);
      await expect(service.hardDeleteByUuid('missing')).rejects.toThrow('thing not found');
    });
  });
});
