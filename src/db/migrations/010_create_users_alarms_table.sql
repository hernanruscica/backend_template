CREATE TABLE users_alarms (
    uuid CHAR(36) PRIMARY KEY,
    alarm_uuid CHAR(36) NOT NULL,
    user_uuid CHAR(36) NOT NULL,
    business_uuid CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by CHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by CHAR(36),
    FOREIGN KEY (alarm_uuid) REFERENCES alarms(uuid) ON DELETE CASCADE,
    FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE,
    FOREIGN KEY (business_uuid) REFERENCES businesses(uuid), 
    FOREIGN KEY (created_by) REFERENCES users(uuid),
    FOREIGN KEY (updated_by) REFERENCES users(uuid)
);
