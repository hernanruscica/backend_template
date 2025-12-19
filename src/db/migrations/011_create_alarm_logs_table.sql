CREATE TABLE alarm_logs (
    uuid CHAR(36) PRIMARY KEY,
    business_uuid CHAR(36) NOT NULL,
    alarm_uuid CHAR(36) NOT NULL,
    user_uuid CHAR(36) NOT NULL,
    channel_uuid CHAR(36) NOT NULL,
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    seen_at TIMESTAMP NULL DEFAULT NULL,
    triggered BOOLEAN DEFAULT true, 
    email_sent BOOLEAN DEFAULT false,
    message VARCHAR(255),    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by CHAR(36),
    updated_by CHAR(36),
    FOREIGN KEY (alarm_uuid) REFERENCES alarms(uuid) ON DELETE CASCADE,
    FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE,
    FOREIGN KEY (channel_uuid) REFERENCES channels(uuid) ON DELETE CASCADE
);

