import { UserModel } from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Controller to handle authentication-related requests
// This includes user login and token generation
export const AuthController = {
  async login(req, res) {
    const { dni, password } = req.body;
    try {
      const user = await UserModel.findByDni(dni);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const businessesUserIsOwner = user.businesses_roles.filter(br=>br.role == 'Owner');
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
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
