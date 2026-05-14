-- CREATE TABLE for new installations
CREATE TABLE backend_logs (
    uuid CHAR(36) PRIMARY KEY,
    action ENUM('create', 'update', 'delete') NULL COMMENT 'Solo para CRUD de entidades, NULL para login/cron/system',
    log_type ENUM('cronjob', 'user', 'system', 'data', 'users', 'businesses', 'alarms', 'channels', 'dataloggers', 'solutions') NOT NULL COMMENT 'Origen del log',
    details TEXT NOT NULL COMMENT 'Descripción detallada en español',
    extra_data JSON NULL COMMENT 'Datos complementarios (user UUID, conteos, errores)',
    log_level ENUM('info', 'warn', 'error') NOT NULL DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ALTER TABLE for existing installations (run if table already exists)
-- ALTER TABLE backend_logs
-- MODIFY COLUMN log_type ENUM(
--   'cronjob', 'user', 'system',
--   'data', 'users', 'businesses',
--   'alarms', 'channels', 'dataloggers', 'solutions'
-- ) NOT NULL COMMENT 'Origen del log';
