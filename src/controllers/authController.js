import { UserModel } from '../models/userModel.js';
import {sendActivationEmailByUuid} from '../services/userService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import catchAsync from '../utils/catchAsync.js';
import CustomError from '../utils/customError.js';
import logger from '../services/loggerService.js';


dotenv.config();

// Controller to handle authentication-related requests
// This includes user login and token generation
export const AuthController = {
  login: catchAsync(async (req, res, next) => {
    const { dni, password } = req.body;
    const ip = req.ip;
    const userAgent = req.get('User-Agent');
    const user = await UserModel.findByDni(dni);
    if (!user) {
      await logger.log({ action: 'login', log_type: 'user', details: `Login fallido: DNI "${dni}" no registrado`, extra_data: { dni, ip, userAgent }, log_level: 'warn' });
      return next(new CustomError('User not found', 404));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logger.log({ action: 'login', log_type: 'user', details: `Login fallido: contraseña incorrecta para ${user.email}`, extra_data: { dni, email: user.email, ip, userAgent }, log_level: 'warn' });
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

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    await logger.log({ action: 'login', log_type: 'user', details: `Login exitoso: ${user.email}`, extra_data: {
      user_uuid: user.uuid,
      email: user.email,
      dni: user.dni,
      isOwner,
      businesses: user.businesses_roles?.length || 0,
      ip,
      userAgent
    }, log_level: 'info' });

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
        const expiredData = jwt.decode(token);
        await logger.log({ action: 'activate', log_type: 'user', details: 'Token de activación expirado', extra_data: { uuid: expiredData?.uuid, userName: expiredData?.userName, dni: expiredData?.dni }, log_level: 'warn' });
        return res.status(401).json({
          success: false,
          message: 'El token de activación ha expirado'
        });
      }
      await logger.log({ action: 'activate', log_type: 'user', details: 'Token de activación inválido', log_level: 'warn' });
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

    await logger.log({ action: 'activate', log_type: 'user', details: `Usuario activado exitosamente: ${userWithDetails.email}`, extra_data: {
      uuid,
      dni,
      email: userWithDetails.email
    }, log_level: 'info' });

    return res.status(200).json({
      success: true,
      message: 'Usuario activado exitosamente',
      user: userWithDetails
    });

  } catch (error) {
    await logger.log({ action: 'activate', log_type: 'user', details: 'Error activando usuario', extra_data: { error: error.message }, log_level: 'error' });
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
        await logger.log({ action: 'send_activation', log_type: 'user', details: `Reenvío activación: email ${email} no registrado`, extra_data: { email }, log_level: 'warn' });
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const sendEmailResults = await sendActivationEmailByUuid(user.uuid);

      if (!sendEmailResults.success) {
        await logger.log({ action: 'send_activation', log_type: 'user', details: `Reenvío activación: fallo al enviar a ${email}`, extra_data: { email, user_uuid: user.uuid }, log_level: 'warn' });
        return res.status(500).json({
          success: false,
          message: 'Error al enviar el correo de activación'
        });
      }

      await logger.log({ action: 'send_activation', log_type: 'user', details: `Email de activación reenviado a ${email}`, extra_data: { email, user_uuid: user.uuid }, log_level: 'info' });

      return res.status(200).json({
        success: true,
        message: `Usuario encontrado, correo de activación enviado a ${email}`,   
        user: sendEmailResults.user     
      });
      
    } catch (error) {
      await logger.log({ action: 'send_activation', log_type: 'user', details: `Error en reenvío de activación para ${email}`, extra_data: { email, error: error.message }, log_level: 'error' });
      return next(error);
    }

    // Aquí se implementaría la lógica para enviar el correo de activación
    // Por ejemplo, generando un nuevo token y enviándolo por email
  }) 
};
