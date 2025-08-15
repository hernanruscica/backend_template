import { UserModel } from '../models/userModel.js';
import { BusinessModel } from '../models/businessModel.js';
import { RoleModel } from '../models/roleModel.js';

import bcrypt from 'bcryptjs';

export const createUser = async (req, res) => {
  try {
    const { street, city, state, country, zipCode, business_uuid, role, ...userData } = req.body;
    const created_by = req.user.uuid;

    const business = await BusinessModel.findByUuid(business_uuid);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const roleObject = await RoleModel.findByName(role);
    if (!roleObject) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const adminRolesNames = req.user.roles;
    const adminRoles = await Promise.all(adminRolesNames.map(roleName => RoleModel.findByName(roleName)));
    const adminHierarchy = Math.min(...adminRoles.map(r => r.hierarchy_level));

    if (roleObject.hierarchy_level >= adminHierarchy) {
      return res.status(403).json({ success: false, message: 'Administrators can only create users with a lower hierarchy level.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const address = { street, city, state, country, zipCode };
    const userPayload = { ...userData, password: hashedPassword, address, createdBy: created_by };
    const newUser = await UserModel.create(userPayload);

    await BusinessModel.addUser(business.uuid, newUser.uuid, roleObject.uuid, created_by);
    
    const userWithDetails = await UserModel.findByUuid(newUser.uuid);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userWithDetails,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll();
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserByUuid = async (req, res) => {
  try {
    const { uuid } = req.params;
    const user = await UserModel.findByUuid(uuid);
    if (!user) {
      return res.status(200).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserByUuid = async (req, res) => {
  try {
    const { uuid } = req.params;
    const updated_by = req.user.uuid;
    const { street, city, state, country, zip_code, ...otherFields } = req.body;
    const fieldsToUpdate = { ...otherFields };

    if (street || city || state || country || zip_code) {
      fieldsToUpdate.address = { street, city, state, country, zip_code };
    }

    if (req.file) {
      fieldsToUpdate.avatar_url = req.file.path;
    }

    const user = await UserModel.findByUuid(uuid);

    if (!user) {
      return res.status(200).json({ success: false, message: 'User not found' });
    }

    await UserModel.update(user.uuid, fieldsToUpdate, updated_by);

    const updatedUser = await UserModel.findByUuid(user.uuid);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUserByUuid = async (req, res) => {
  try {
    const { uuid } = req.params;
    const user = await UserModel.findByUuid(uuid);
    if (!user) {
      return res.status(200).json({ success: false, message: 'User not found' });
    }
    const result = await UserModel.delete(user.uuid);
    if (result.affectedRows === 0) {
      return res.status(200).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
