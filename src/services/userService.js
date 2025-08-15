import { UserModel } from '../models/userModel.js';
import { BusinessModel } from '../models/businessModel.js';
import { RoleModel } from '../models/roleModel.js';
import CustomError from '../utils/customError.js';
import bcrypt from 'bcryptjs';

export const createUserService = async (userData, businessUuid, roleName, adminUser) => {
  const { street, city, state, country, zipCode, ...restOfUserData } = userData;

  const business = await BusinessModel.findByUuid(businessUuid);
  if (!business) {
    throw new CustomError('Business not found', 404);
  }

  const roleObject = await RoleModel.findByName(roleName);
  if (!roleObject) {
    throw new CustomError('Role not found', 404);
  }

  const adminRolesNames = adminUser.roles;
  const adminRoles = await Promise.all(adminRolesNames.map(roleName => RoleModel.findByName(roleName)));
  const adminHierarchy = Math.min(...adminRoles.map(r => r.hierarchy_level));

  if (roleObject.hierarchy_level >= adminHierarchy) {
    throw new CustomError('Administrators can only create users with a lower hierarchy level.', 403);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(restOfUserData.password, salt);

  const address = { street, city, state, country, zipCode };
  const userPayload = { ...restOfUserData, password: hashedPassword, address, createdBy: adminUser.uuid };
  const newUser = await UserModel.create(userPayload);

  await BusinessModel.addUser(business.uuid, newUser.uuid, roleObject.uuid, adminUser.uuid);
  
  return UserModel.findByUuid(newUser.uuid);
};

export const getAllUsersService = async () => {
  return UserModel.findAll();
};

export const getUserByUuidService = async (uuid) => {
  const user = await UserModel.findByUuid(uuid);
  if (!user) {
    throw new CustomError('User not found', 404);
  }
  return user;
};

export const updateUserByUuidService = async (uuid, updateData, updatedBy, file) => {
  const { street, city, state, country, zip_code, ...otherFields } = updateData;
  const fieldsToUpdate = { ...otherFields };

  if (street || city || state || country || zip_code) {
    fieldsToUpdate.address = { street, city, state, country, zip_code };
  }

  if (file) {
    fieldsToUpdate.avatar_url = file.path;
  }

  const user = await UserModel.findByUuid(uuid);
  if (!user) {
    throw new CustomError('User not found', 404);
  }

  await UserModel.update(uuid, fieldsToUpdate, updatedBy);
  return UserModel.findByUuid(uuid);
};

export const deleteUserByUuidService = async (uuid) => {
  const user = await UserModel.findByUuid(uuid);
  if (!user) {
    throw new CustomError('User not found', 404);
  }
  const result = await UserModel.delete(uuid);
  if (result.affectedRows === 0) {
    throw new CustomError('User not found', 404);
  }
  return { message: 'User deleted successfully' };
};
