import BaseService from './baseService.js';
import ChannelModel from '../models/ChannelModel.js';

const genericService = BaseService(ChannelModel);

const create = async (data, user) => {
  // In a real application, you would add permission logic here.
  return ChannelModel.create(data, user.uuid);
};

const getAll = async (user) => {
  // In a real application, you would add permission logic here.
  return ChannelModel.findAll();
};

export const ChannelService = {
  ...genericService,
  create,
  getAll,
};
