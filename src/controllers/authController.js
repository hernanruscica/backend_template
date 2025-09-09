import { UserModel } from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import catchAsync from '../utils/catchAsync.js';
import CustomError from '../utils/customError.js';

dotenv.config();

// Controller to handle authentication-related requests
// This includes user login and token generation
export const AuthController = {
  login: catchAsync(async (req, res, next) => {
    const { dni, password } = req.body;
    const user = await UserModel.findByDni(dni);
    if (!user) {
      return next(new CustomError('User not found', 404));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new CustomError('Invalid credentials', 401));
    }
    const businessesUserIsOwner = user.businesses_roles.filter(br => br.role == 'Owner');
    const isOwner = businessesUserIsOwner.length > 0;

    const payload = {
      uuid: user.uuid,
      roles: user.businesses_roles.map((br) => {
        return {
          role: br.role,
          businessUuid: br.uuid,
          businessName: br.name,
        }
      }),
      isOwner: isOwner,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  })
};
