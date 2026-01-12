-- Get alarmLogs with alarm name and triggered time and value order by triggered time descending
SELECT alarms.name as alarm_name, alarm_logs.triggered_at, alarm_logs.triggered_value 
FROM `alarm_logs` 
INNER JOIN alarms ON alarms.uuid = alarm_logs.alarm_uuid
ORDER by triggered_at DESC;