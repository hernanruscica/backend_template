import BaseModel from './BaseModel.js';

const allowedFields = [  
  'business_uuid',
  'alarm_uuid',
  'user_uuid',
  'channel_uuid',
  'triggered_at',
  'seen_at',
  'triggered',
  'email_sent',
  'message',
];

export const AlarmLogModel = BaseModel('alarm_logs', allowedFields);
