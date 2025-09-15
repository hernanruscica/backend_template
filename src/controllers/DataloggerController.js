import BaseController from './BaseController.js';
import DataloggerService from '../services/DataloggerService.js';

const DataloggerController = BaseController(DataloggerService);
export default DataloggerController;
