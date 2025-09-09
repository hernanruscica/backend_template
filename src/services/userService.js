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


  const adminRoles = adminUser.businesses_roles.map(br => br.role);
  const adminIsOwner = adminRoles.includes('Owner');

  if (!adminIsOwner) {
    const adminBusinesses = adminUser.businesses_roles.map(br => br.uuid);
    if (!adminBusinesses.includes(businessUuid)) {
      throw new CustomError('Administrators can only create users in their own business.', 403);
    }
  }

  const adminHierarchy = Math.min(...adminUser.businesses_roles.map(br => br.hierarchy_level));

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

export const getAllUsersService = async (user) => {
  
  if (user.isOwner) {
    const users = await UserModel.findAll();
    return users;
  }

  const business = await BusinessModel.findBusinessByUserId(user.uuid);
  if (!business) {
    throw new CustomError('User is not associated with any business', 404);
  }
  
  const users = await UserModel.findAllByBusinessUuid(business.uuid);
  return users;
};

export const getUserByUuidService = async (uuid) => {
  const user = await UserModel.findByUuid(uuid);
  if (!user) {
    throw new CustomError('User not found', 404);
  }
  return user;
};

export const updateUserByUuidService = async (uuid, updateData, updatedBy, file) => {

  console.log('updatedBy', updatedBy);
  const user = await UserModel.findByUuid(uuid);
  if (!user) {
    throw new CustomError('User not found', 404);
  }

  const fieldsToUpdate = {};

  // Copy all non-address fields that are not undefined
  for (const key in updateData) {
    if (updateData[key] !== undefined && !['street', 'city', 'state', 'country', 'zip_code'].includes(key)) {
      fieldsToUpdate[key] = updateData[key];
    }
  }

  // Handle address fields
  const addressUpdates = {};
  const addressFields = ['street', 'city', 'state', 'country', 'zip_code'];
  let hasAddressUpdate = false;
  addressFields.forEach(field => {
    if (updateData[field] !== undefined) {
      addressUpdates[field] = updateData[field];
      hasAddressUpdate = true;
    }
  });

  if (hasAddressUpdate) {
    fieldsToUpdate.address = { ...(user.address || {}), ...addressUpdates };
  }

  if (file) {
    fieldsToUpdate.avatar_url = file.path;
  }

  if (Object.keys(fieldsToUpdate).length === 0 && !file) {
    return user;
  }

  await UserModel.update(uuid, fieldsToUpdate, updatedBy);
  return UserModel.findByUuid(uuid);
};

export const deleteUserByUuidService = async (uuid, adminUser) => {
  const user = await UserModel.findByUuid(uuid);
  if (!user) {
    throw new CustomError('User not found', 404);
  }
  const result = await UserModel.delete(uuid, adminUser.uuid);
  if (result.affectedRows === 0) {
    throw new CustomError('User not found', 404);
  }
  return { message: 'User deleted successfully', user: {...user, is_active: false} };
};

export const hardDeleteUserByUuidService = async (uuid) => {
  const user = await UserModel.findByUuid(uuid);
  if (!user) {
    throw new CustomError('User not found', 404);
  }
  const result = await UserModel.hardDelete(uuid);
  if (result.affectedRows === 0) {
    throw new CustomError('User not found', 404);
  }
  return { message: 'User permanently deleted successfully', user };
};
