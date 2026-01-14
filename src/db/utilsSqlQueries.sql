-- Get alarmLogs with alarm name and triggered time and value order by triggered time descending
SELECT alarms.name as alarm_name, alarm_logs.triggered_at, alarm_logs.triggered_value 
FROM `alarm_logs` 
INNER JOIN alarms ON alarms.uuid = alarm_logs.alarm_uuid
ORDER by triggered_at DESC;

-- encontrar un alarm log por su uuid y obtener user, fecha de disparo, estado de disparo y fecha de visto
SELECT user_uuid, triggered_at, triggered, seen_at 
FROM `alarm_logs`
WHERE uuid = '47d2c599-d174-4247-9ea2-a60b617cfea3';