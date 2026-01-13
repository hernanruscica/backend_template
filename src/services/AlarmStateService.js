import AlarmModel from '../models/AlarmModel.js';
import UserAlarmModel from '../models/UserAlarmModel.js';
import { AlarmLogModel } from '../models/AlarmLogModel.js';
import { sendMessage } from '../utils/mail.js';
import generateTokenAlarmLog from '../utils/generateTokenAlarmLog.js';
import crypto from 'crypto';

class AlarmStateService {
  
  /**
   * Maneja el cambio de estado de una alarma (Disparo o Reseteo)
   */
  async handleStateChange(alarm, isTriggered, variables, message) {
    // 1. Verificar si el estado realmente cambió para evitar escrituras innecesarias
    // (Asumiendo que alarm.disparada es 1 o 0)
    const newState = isTriggered ? 1 : 0;
    
    if (alarm.triggered == newState) {
      // El estado no ha cambiado, no hacemos nada (o logueamos debug)
      return; 
    }

    console.log(`🔄 Cambio de estado para alarma ${alarm.name}: ${alarm.triggered} -> ${newState}`);

    // 2. Actualizar la alarma en DB - Example: async update(uuid, fields, updatedBy)
    await AlarmModel.update(alarm.uuid, {triggered: newState}, null); 
    //console.log('results from alarmStateService', results);
    

    // 3. Obtener usuarios suscritos
    const usersAffected = await UserAlarmModel.findUsersByAlarmUuid(alarm.uuid);
    //console.log('usersAffected', usersAffected);
    
    if (!usersAffected || usersAffected.length === 0) return;

    const eventUuidForAllUsersAffects = crypto.randomUUID()
    // 4. Procesar notificaciones para cada usuario (Parallel processing)
    const notificationPromises = usersAffected.map(user => 
      this.notifyUser(user, alarm, newState, variables, message, eventUuidForAllUsersAffects)
    );

    await Promise.allSettled(notificationPromises);
  }

  async notifyUser(user, alarm, isTriggered, variables, message = `Alarma ${isTriggered == 1 ? 'disparada' : 'reseteada'}`, eventUuid) {
    try {     
      let emailSent = 0;
      if (isTriggered == 1) {
        // B. Generar Token y Enviar Email
        const token = generateTokenAlarmLog(user.uuid, alarm.uuid, alarm.canal_id, alarm.datalogger_id);
        
        // Aquí podrías ajustar el subject/body según si esTriggered es 1 (ALERTA) o 0 (NORMALIZADO)
        emailSent = await sendMessage(alarm, variables, user.email, token, isTriggered);

        if(emailSent){
          console.log(`📧 Notificación enviada a ${user.email} (Triggered: ${isTriggered})`);
        }
      }

      // Obtenemos el offset (ej: -3) de tu variable de entorno o usamos -3 por defecto
      const timezoneOffset = parseInt(process.env.TIME_ZONE_OFFSET) || -3;
     
       // A. Crear Log
      const alarmLog = {
        business_uuid: alarm.business_uuid, 
        alarm_uuid: alarm.uuid, 
        event_uuid: eventUuid,
        user_uuid: user.user_uuid,
        channel_uuid: alarm.channel_uuid,
        triggered: isTriggered,                
        triggered_at: new Date(Date.now() + (timezoneOffset * 60 * 60 * 1000)),
        triggered_value: variables.value,
        datalogger_uuid: alarm.datalogger_uuid,
        email_sent: emailSent,        
        message: message || null        
      };
     
      const logId = await AlarmLogModel.create(alarmLog);

      console.log('logId de la creacion de alarmlogModel', logId);
      
      
      if (!logId) throw new Error("No se pudo crear el log");   

      

    } catch (error) {
      console.error(`❌ Error notificando usuario ${user.email}:`, error);
    }
  }
}

export default new AlarmStateService();