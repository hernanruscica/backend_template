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
  const { businessUuid } = req.params;
  //console.log('Business UUID from params:', businessUuid);  
  const users = await getAllUsersService(user, businessUuid);
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
  const updatedUser = await updateUserByUuidService(uuid, req.body, req.user, req.file);
  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    user: updatedUser,
  });
});

export const deleteUserByUuid = catchAsync(async (req, res, next) => {
  const { uuid } = req.params;
  let response;
  if (req.hardDelete) {
    response = await hardDeleteUserByUuidService(uuid);
  } else {
    response = await deleteUserByUuidService(uuid, req.user);
  }
  res.status(200).json({
    success: true,
    message: response.message,
    user: response.user,
  });
});
