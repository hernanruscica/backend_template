import cron from 'node-cron';
import { pool } from '../config/database.js';

import ChannelModel from '../models/ChannelModel.js';

import MaintenanceLogModel from '../models/MaintenanceLogModel.js';

import DataService from '../services/DataService.js';
import { sendMessage } from '../utils/mail.js';

const MAINTENANCE_CRON_HOUR = 1;

let isRunning = false;

const startMaintenanceAlertJob = () => {
   cron.schedule(`0 ${MAINTENANCE_CRON_HOUR} * * *`, async () => {
    //cron.schedule(`* * * * *`, async () => {
    if (isRunning) {
      console.log('⚠️ El job de Maintenance Alert sigue corriendo. Saltando esta ejecución.');
      return;
    }

    isRunning = true;
    try {
      console.log('🔧 Iniciando chequeo de mantenimientos programados...');
      await checkMaintenanceAlerts();
    } catch (error) {
      console.error('❌ Error en el job de Maintenance Alert:', error);
    } finally {
      isRunning = false;
      console.log('🏁 Chequeo de mantenimientos finalizado.');
    }
  });
  console.log(`✅ Job MaintenanceAlert programado para ejecutarse cada 12 horas a las ${MAINTENANCE_CRON_HOUR}:00`);
};

const checkMaintenanceAlerts = async () => {
  const channels = await ChannelModel.findAll();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  for (const channel of channels) {
    if (!channel.is_active) continue;

    const { uuid: channelUuid, name: channelName, datalogger_uuid, business_uuid } = channel;
    const dataloggerUuid = channel.datalogger?.uuid || datalogger_uuid;
    const businessUuid = channel.business?.uuid || business_uuid;

    if (!businessUuid || !channelUuid) {
      console.log(`⚠️ Canal ${channelUuid} sin business_uuid, saltando.`);
      continue;
    }

    const totalHoursData = await DataService.getTotalOnTimeFromChannelByPeriod(channelUuid, null, null);
    const totalTimeOnHours = totalHoursData?.total_time_on_hours || 0;

    const maintenanceLogs = await MaintenanceLogModel.findAllByDataloggerAndChannel(
      dataloggerUuid,
      channelUuid,
      businessUuid
    );

    for (const maintenance of maintenanceLogs) {
      if (maintenance.status === 'completed') continue;

      const scheduledDate = new Date(maintenance.scheduled_date);
      scheduledDate.setHours(0, 0, 0, 0);
      const scheduledDateStr = scheduledDate.toISOString().split('T')[0];

      const condition1 = scheduledDateStr === todayStr;
      const condition2 = maintenance.time_usage <= totalTimeOnHours;

      let canSendNotification = false;
      if (condition1 || condition2) {
        if (!maintenance.last_notification_sent_at) {
          canSendNotification = true;
        } else {
          const lastSent = new Date(maintenance.last_notification_sent_at);
          const hoursSinceLastSent = (today - lastSent) / (1000 * 60 * 60);
          if (hoursSinceLastSent >= 12) {
            canSendNotification = true;
          }
        }
      }

      if (canSendNotification) {
        const admins = await getUsersByRole(businessUuid, ['Administrator', 'Technician']);

        for (const admin of admins) {
          await sendMaintenanceEmail(admin, maintenance, channel, channel.business, totalTimeOnHours);
        }

        await MaintenanceLogModel.markNotificationSent(maintenance.uuid);
        console.log(`📧 Notificación enviada para maintenance: ${maintenance.title}`);
      }
    }
  }
};

const getUsersByRole = async (businessUuid, roles) => {
  const placeholders = roles.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT u.* 
     FROM users u
     JOIN business_users bu ON u.uuid = bu.user_uuid
     JOIN roles r ON bu.role_uuid = r.uuid
     WHERE bu.business_uuid = ?
       AND r.name IN (${placeholders})`,
    [businessUuid, ...roles]
  );
  return rows;
};

const sendMaintenanceEmail = async (user, maintenance, channel, business, totalTimeOnHours) => {
  const alarmData = {
    name: `Mantenimiento: ${maintenance.title}`,
    alarm_type: 'maintenance_alert',
    updated_at: new Date()
  };

  const variables = {
    value: '',
    location: business?.name || 'N/A',
    datalogger: channel.datalogger?.name || 'N/A',
    channel: channel.name,
    title: maintenance.title,
    description: maintenance.description,
    scheduled_date: maintenance.scheduled_date,
    current_hours: totalTimeOnHours,
    required_hours: maintenance.time_usage
  };

  const token = `maintenance_${maintenance.uuid}_${Date.now()}`;

  await sendMessage(alarmData, variables, user.email, token, 1);
};

export default startMaintenanceAlertJob;