import jwt from 'jsonwebtoken';

/**
 * Genera un token JWT para reconocer una alarma.
 * * @param {string|number} logId - ID del registro en alarm_logs
 * @param {string} userId - UUID del usuario
 * @param {string} alarmId - UUID de la alarma
 * @param {string} channelId - UUID del canal
 * @param {string} dataloggerId - UUID del datalogger
 * @returns {string} El token firmado
 */
const generateTokenAlarmLog = (logId, userId, alarmId, channelId, dataloggerId, businessUuid, alarmType) => {
  
  // Asegúrate de tener esta variable en tu archivo .env
  const secretKey = process.env.JWT_SECRET || 'tu_secreto_super_seguro_para_desarrollo';

  const payload = {
    logId,
    userId,
    alarmId,
    channelId,
    dataloggerId,
    businessUuid,    
    type: alarmType
  };

  // Firmamos el token.
  // expiresIn: '48h' le da al usuario 2 días para hacer clic en el enlace del correo.
  const token = jwt.sign(payload, secretKey, { expiresIn: '24h' });

  return token;
};

export default generateTokenAlarmLog;