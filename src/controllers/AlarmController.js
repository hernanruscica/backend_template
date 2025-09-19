import BaseController from './BaseController.js';
import AlarmService from '../services/AlarmService.js';

const AlarmController = BaseController(AlarmService);
export default AlarmController;
