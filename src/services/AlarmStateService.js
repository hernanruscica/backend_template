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
    
    if (alarm.disparada === newState) {
      // El estado no ha cambiado, no hacemos nada (o logueamos debug)
      return; 
    }

    console.log(`🔄 Cambio de estado para alarma ${alarm.nombre}: ${alarm.disparada} -> ${newState}`);

    // 2. Actualizar la alarma en DB
    await AlarmModel.updateTrigger(alarm.uuid, newState); // Ojo: Usar UUID si tu modelo lo pide, o ID.

    // 3. Obtener usuarios suscritos
    const usersAffected = await UserAlarmModel.findUsersByAlarmId(alarm.uuid);
    if (!usersAffected || usersAffected.length === 0) return;

    // 4. Procesar notificaciones para cada usuario (Parallel processing)
    const notificationPromises = usersAffected.map(user => 
      this.notifyUser(user, alarm, newState, variables)
    );

    await Promise.allSettled(notificationPromises);
  }

  async notifyUser(user, alarm, isTriggered, variables) {
    try {
      // A. Crear Log
      const alarmLog = {
        alarma_id: alarm.uuid, // O uuid según tu esquema
        usuario_id: user.uuid,
        canal_id: alarm.canal_id,
        business_uuid: alarm.business_uuid, // Agregado por consistencia con tus tablas nuevas
        variables: JSON.stringify(variables),
        disparada: isTriggered,
        triggered_at: new Date() // El seeder mostraba timestamp
      };

      const logId = await AlarmLogModel.create(alarmLog);
      
      if (!logId) throw new Error("No se pudo crear el log");

      // B. Generar Token y Enviar Email
      const token = generateTokenAlarmLog(logId, user.uuid, alarm.uuid, alarm.canal_id, alarm.datalogger_id);
      
      // Aquí podrías ajustar el subject/body según si esTriggered es 1 (ALERTA) o 0 (NORMALIZADO)
      const emailSent = await sendMessage(alarm, variables, user.email, token, isTriggered);
      
      // Opcional: Actualizar el log indicando si se envió el email (tu tabla alarm_logs tiene email_sent)
      if (emailSent) {
          // await AlarmLogModel.updateEmailSent(logId, true);
      }

      console.log(`📧 Notificación enviada a ${user.email} (Triggered: ${isTriggered})`);

    } catch (error) {
      console.error(`❌ Error notificando usuario ${user.email}:`, error);
    }
  }
}

export default new AlarmStateService();