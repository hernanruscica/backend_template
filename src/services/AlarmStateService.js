import AlarmModel from '../models/AlarmModel.js';
import UserAlarmModel from '../models/UserAlarmModel.js';
import { AlarmLogModel } from '../models/AlarmLogModel.js';
import { sendMessage } from '../utils/mail.js';
import generateTokenAlarmLog from '../utils/generateTokenAlarmLog.js';

class AlarmStateService {
  
  /**
   * Maneja el cambio de estado de una alarma (Disparo o Reseteo)
   */
  async handleStateChange(alarm, isTriggered, variables) {
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

    // 4. Procesar notificaciones para cada usuario (Parallel processing)
    const notificationPromises = usersAffected.map(user => 
      this.notifyUser(user, alarm, newState, variables)
    );

    await Promise.allSettled(notificationPromises);
  }

  async notifyUser(user, alarm, isTriggered, variables) {
    try {     

        // B. Generar Token y Enviar Email
      const token = generateTokenAlarmLog(user.uuid, alarm.uuid, alarm.canal_id, alarm.datalogger_id);
      
      // Aquí podrías ajustar el subject/body según si esTriggered es 1 (ALERTA) o 0 (NORMALIZADO)
      const emailSent = await sendMessage(alarm, variables, user.email, token, isTriggered);

      if(emailSent){
        console.log(`📧 Notificación enviada a ${user.email} (Triggered: ${isTriggered})`);
      }
     
       // A. Crear Log
      const alarmLog = {
        alarm_uuid: alarm.uuid, // O uuid según tu esquema
        user_uuid: user.user_uuid,
        channel_uuid: alarm.channel_uuid,
        business_uuid: alarm.business_uuid, // Agregado por consistencia con tus tablas nuevas
        triggered: isTriggered,
        triggered_at: new Date(),
        email_sent: emailSent,
        message:`mensaje de alarma ${(isTriggered) ? 'disparada.' : 'reseteada.'}`        
      };
     
      const logId = await AlarmLogModel.create(alarmLog);
      
      if (!logId) throw new Error("No se pudo crear el log");   

      

    } catch (error) {
      console.error(`❌ Error notificando usuario ${user.email}:`, error);
    }
  }
}

export default new AlarmStateService();