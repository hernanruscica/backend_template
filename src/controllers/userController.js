import CustomError from '../utils/customError.js';
import catchAsync from '../utils/catchAsync.js';
import {
  createUserService,
  getAllUsersService,
  getUserByUuidService,
  updateUserByUuidService,
  deleteUserByUuidService,
} from '../services/userService.js';

export const createUser = catchAsync(async (req, res, next) => {
  const { business_uuid, role, ...userData } = req.body;
  const userWithDetails = await createUserService(userData, business_uuid, role, req.user);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: userWithDetails,
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await getAllUsersService();
  res.status(200).json({
    success: true,
    users,
  });
});

export const getUserByUuid = catchAsync(async (req, res, next) => {
  const { uuid } = req.params;
  const user = await getUserByUuidService(uuid);
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateUserByUuid = catchAsync(async (req, res, next) => {
  const { uuid } = req.params;
  const updatedUser = await updateUserByUuidService(uuid, req.body, req.user.uuid, req.file);

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    user: updatedUser,
  });
});

export const deleteUserByUuid = catchAsync(async (req, res, next) => {
  const { uuid } = req.params;
  await deleteUserByUuidService(uuid);
  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});
