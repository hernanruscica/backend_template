CREATE TABLE alarm_logs (
    uuid CHAR(36) PRIMARY KEY,
    business_uuid CHAR(36) NOT NULL,
    event_uuid CHAR(36) NOT NULL, -- Campo Nuevo: Identificador del incidente
    alarm_uuid CHAR(36) NOT NULL,
    user_uuid CHAR(36) NOT NULL,
    channel_uuid CHAR(36) NOT NULL,
    datalogger_uuid CHAR(36) NULL, -- Campo Nuevo: Identificador del datalogger
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    triggered_value FLOAT NULL DEFAULT NULL,
    seen_at TIMESTAMP NULL DEFAULT NULL,
    triggered BOOLEAN DEFAULT true, -- Mantenido a pedido tuyo
    email_sent BOOLEAN DEFAULT false,
    message VARCHAR(255),    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by CHAR(36),    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by CHAR(36),
    
    FOREIGN KEY (alarm_uuid) REFERENCES alarms(uuid) ON DELETE CASCADE,
    FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE,
    FOREIGN KEY (channel_uuid) REFERENCES channels(uuid) ON DELETE CASCADE,
    
    -- ÍNDICE IMPORTANTE: Acelera la búsqueda de logs por evento
    INDEX idx_alarm_logs_event (event_uuid)
);

