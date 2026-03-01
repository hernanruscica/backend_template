import BaseController from './BaseController.js';
import AlarmService from '../services/AlarmService.js';

const AlarmController = BaseController(AlarmService);

const getAllByUser = async (req, res, next) => {
  try {
    const { businessUuid, userId } = req.params;
    const user = req.user;
    //console.log('userId en AlarmController: ', userId);
    //fetch alarms for the user in the specified business
    const alarms = await AlarmService.getAllByUser(user, businessUuid, userId);
    res.status(200).json({
            success: true,
            count: alarms.length,
            alarms,
        });
  } catch (error) {
    next(error);
  }
};

AlarmController.getAllByUser = getAllByUser;


export default AlarmController;
