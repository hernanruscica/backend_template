import { UserModel } from '../models/userModel.js';
import {sendActivationEmailByUuid} from '../services/userService.js';
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
  }),
  activateUser: catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const password = req.body.password;

    console.log('body', req.body)

  if (!token) {
    return res.status(400).json({ 
      success: false,
      message: 'Token de activación no proporcionado'
    });
  }

  try {
    // Verificar si el token es válido
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'El token de activación ha expirado'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Token de activación inválido'
      });
    }

    const { uuid, userName, dni } = decodedToken;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Actualizar estado del usuario 
    const response = await UserModel.update(uuid, {is_active: true, password: hashedPassword}, uuid );   
    
    if (response?.affectedRows < 1) {
      return res.status(500).json({
        success: false,
        message: 'Error al activar el usuario'
      });
    }

    const userWithDetails = await UserModel.findByUuid(uuid);
    if (!userWithDetails) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado después de la activación'
      });
    }
    
    delete userWithDetails.password;

    return res.status(200).json({
      success: true,
      message: 'Usuario activado exitosamente',
      user: userWithDetails
    });

  } catch (error) {
    console.error('Error en activación de usuario:', error);
    next(error);
  }
  }),
  sendActivationEmail: catchAsync(async (req, res, next) => {    
    const { email } = req.params;
    //console.log('sendactivation email', email);    

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email no proporcionado'
      });
    }

    try {
      const user = await UserModel.findByEmail(email);
            
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const sendEmailResults = await sendActivationEmailByUuid(user.uuid);

      if (!sendEmailResults.success) {
        return res.status(500).json({
          success: false,
          message: 'Error al enviar el correo de activación'
        });
      }

      return res.status(200).json({
        success: true,
        message: `Usuario encontrado, correo de activación enviado a ${email}`,   
        user: sendEmailResults.user     
      });
      
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      return next(error);
    }

    // Aquí se implementaría la lógica para enviar el correo de activación
    // Por ejemplo, generando un nuevo token y enviándolo por email
  }) 
};
