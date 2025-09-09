import CustomError from '../utils/customError.js';
import catchAsync from '../utils/catchAsync.js';
import {
  createUserService,
  getAllUsersService,
  getUserByUuidService,
  updateUserByUuidService,
  deleteUserByUuidService,
  hardDeleteUserByUuidService,
} from '../services/userService.js';
import { UserModel } from '../models/userModel.js';

export const createUser = catchAsync(async (req, res, next) => {
  const { business_uuid, role, ...userData } = req.body;
  const adminUser = await UserModel.findByUuid(req.user.uuid);
  const userWithDetails = await createUserService(userData, business_uuid, role, adminUser);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: userWithDetails,
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {  
  const { user } = req;  
  const users = await getAllUsersService(user);
  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

export const getUserByUuid = catchAsync(async (req, res, next) => {
  const { uuid } = req.params;
  const requester = await UserModel.findByUuid(req.user.uuid);
  const user = await getUserByUuidService(uuid, requester);
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateUserByUuid = catchAsync(async (req, res, next) => {
  const { uuid } = req.params;
  const { uuidOrigin } = req.body
  const userRolesOriginBusiness = req.user.roles.find(ur => ur.businessUuid === uuidOrigin);
  const isTechnician = userRolesOriginBusiness?.role === 'Technician';
  // console.log('isTechnician', isTechnician);
  // console.log('uuid', uuid);
  // console.log('user.uuid', req.user.uuid);
  
  
  //'Technician' users only can update his own user
  if (isTechnician && uuid !==  req.user.uuid){
    return res.status(400).json({
      success: false,
      message: 'This user role only can UPDATE his own user'
    })
  }

  const updatedUser = await updateUserByUuidService(uuid, req.body, req.user.uuid, req.file);
  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    user: updatedUser,
  });
});

export const deleteUserByUuid = catchAsync(async (req, res, next) => {
  const { uuid } = req.params;
  let response = [];
  console.log(req.hardDelete)
  if (req.hardDelete) {
    response = await hardDeleteUserByUuidService(uuid);    
  } else {
    response = await deleteUserByUuidService(uuid, req.user);
  }
  res.status(200).json({
    success: true,
    message: response.message,
    user: response.user
  });
});
