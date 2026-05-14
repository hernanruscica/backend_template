import { UserModel } from '../models/userModel.js';
import { BusinessModel } from '../models/businessModel.js';
import { RoleModel } from '../models/roleModel.js';
import CustomError from '../utils/customError.js';
import bcrypt from 'bcryptjs';
import { sendActivation } from '../utils/mail.js';
import jwt from 'jsonwebtoken';
import logger from './loggerService.js';

//Function to generate activation token and send activation email by UUID
  export const sendActivationEmailByUuid = async (userUuid) => {
    const userWithDetails = await UserModel.findByUuid(userUuid);
    const businessesUserIsOwner = userWithDetails.businesses_roles.filter(br => br.role == 'Owner');
    const isOwner = businessesUserIsOwner.length > 0;
    const payload = {
          uuid: userWithDetails.uuid,
          user_first_name: userWithDetails.first_name,
          user_last_name: userWithDetails.last_name,
          dni: userWithDetails.dni,
          roles: userWithDetails.businesses_roles.map((br) => {
            return {
              role: br.role,
              businessUuid: br.uuid,
              businessName: br.name,
            }
          }),
          isOwner: isOwner,
        };  
    const activation_token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    const emailSentOk = await sendActivation(activation_token, userWithDetails);
    return {success: emailSentOk, user: userWithDetails};
  }

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
  //console.log('userPayload on userService', userPayload);
  
  const newUser = await UserModel.create(userPayload);

  await BusinessModel.addUser(business.uuid, newUser.uuid, roleObject.uuid, adminUser.uuid);
  
  const sendEmailResults = await sendActivationEmailByUuid(newUser.uuid);  

  if (!sendEmailResults.success) {
    await logger.log({
      action: 'create',
      log_type: 'users',
      details: `Error al crear usuario: falló envío de email de activación a "${newUser.email}"`,
      extra_data: {
        entity_uuid: newUser.uuid,
        entity_email: newUser.email,
        business_uuid: businessUuid,
        created_by_uuid: adminUser.uuid,
        created_by_email: adminUser.email
      },
      log_level: 'error'
    });
    throw new CustomError('User created but failed to send activation email.', 500);
  }

  await logger.log({
    action: 'create',
    log_type: 'users',
    details: `Se creó usuario "${newUser.email}" en negocio ${businessUuid} por admin ${adminUser.email}`,
    extra_data: {
      entity_uuid: newUser.uuid,
      entity_email: newUser.email,
      business_uuid: businessUuid,
      created_by_uuid: adminUser.uuid,
      created_by_email: adminUser.email
    },
    log_level: 'info'
  });

  return sendEmailResults.user;
};

export const getAllUsersService = async (user, businessUuid = null) => {
  
  if (user.isOwner) {
    //console.log('user on getAllUsersService', user);
    
    const users = await UserModel.findAll();
    return users;
  }  

  const users = await UserModel.findAllByBusinessUuid(businessUuid);
  //devuelo los usuarios que No tengan algun role de Owner
  return users.filter(us => us?.businesses_roles.some(br => br.role !== 'Owner'));
};

export const getUserByUuidService = async (uuid) => {
  const user = await UserModel.findByUuid(uuid);
  if (!user) {
    throw new CustomError('User not found', 404);
  }
  return user;
};

export const updateUserByUuidService = async (uuid, updateData, requesterUser, file) => {
  const { uuidOrigin, ...restOfUpdateData } = updateData;
  const userRolesOriginBusiness = requesterUser.roles.find(ur => ur.businessUuid === uuidOrigin);
  const isTechnician = userRolesOriginBusiness?.role === 'Technician';

  if (isTechnician && uuid !== requesterUser.uuid) {
    throw new CustomError('This user role only can UPDATE his own user', 403);
  }
  
  const user = await UserModel.findByUuid(uuid);
  
  if (!user) {
    throw new CustomError('User not found', 404);
  }

  const fieldsToUpdate = {};

  for (const key in restOfUpdateData) {
    if (restOfUpdateData[key] !== undefined && !['street', 'city', 'state', 'country', 'zip_code'].includes(key)) {
      fieldsToUpdate[key] = restOfUpdateData[key];
    }
  }

  const addressUpdates = {};
  const addressFields = ['street', 'city', 'state', 'country', 'zip_code'];
  let hasAddressUpdate = false;
  addressFields.forEach(field => {
    if (restOfUpdateData[field] !== undefined) {
      addressUpdates[field] = restOfUpdateData[field];
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

  await UserModel.update(uuid, fieldsToUpdate, requesterUser.uuid);
  const updatedUser = await UserModel.findByUuid(uuid);

  await logger.log({
    action: 'update',
    log_type: 'users',
    details: `Se actualizó usuario "${user.email}" por admin ${requesterUser.uuid}`,
    extra_data: {
      entity_uuid: uuid,
      entity_email: user.email,
      changed_fields: Object.keys(fieldsToUpdate),
      updated_by_uuid: requesterUser.uuid
    },
    log_level: 'info'
  });

  return updatedUser;
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

  await logger.log({
    action: 'delete',
    log_type: 'users',
    details: `Se eliminó usuario "${user.email}"`,
    extra_data: {
      entity_uuid: uuid,
      entity_email: user.email,
      updated_by_uuid: adminUser.uuid
    },
    log_level: 'info'
  });

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

  await logger.log({
    action: 'delete',
    log_type: 'users',
    details: `Se eliminó permanentemente usuario "${user.email}"`,
    extra_data: {
      entity_uuid: uuid,
      entity_email: user.email
    },
    log_level: 'info'
  });

  return { message: 'User permanently deleted successfully', user };
};
