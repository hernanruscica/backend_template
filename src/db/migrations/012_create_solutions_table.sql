CREATE TABLE solutions (
    uuid CHAR(36) PRIMARY KEY,
    business_uuid CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    alarms_logs_id CHAR(36), -- CORREGIDO: Era INT, cambiado a CHAR(36) para coincidir con alarm_logs
    user_id CHAR(36),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by CHAR(36),
    updated_by CHAR(36),
    FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE SET NULL,
    FOREIGN KEY (business_uuid) REFERENCES businesses(uuid) ON DELETE CASCADE,
    FOREIGN KEY (alarms_logs_id) REFERENCES alarm_logs(uuid) ON DELETE SET NULL
);