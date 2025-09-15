import BaseService from './baseService.js';
import { SolutionModel } from '../models/SolutionModel.js';

const genericService = BaseService(SolutionModel);

const create = async (data, user) => {
  // In a real application, you would add permission logic here.
  return SolutionModel.create(data, user.uuid);
};

const getAll = async (user) => {
  // In a real application, you would add permission logic here.
  return SolutionModel.findAll();
};

export const SolutionService = {
  ...genericService,
  create,
  getAll,
};
