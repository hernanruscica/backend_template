CREATE TABLE role_permissions (
    role_uuid CHAR(36) NOT NULL,
    action VARCHAR(10) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by CHAR(36),
    PRIMARY KEY (role_uuid, action, entity),
    FOREIGN KEY (role_uuid) REFERENCES roles(uuid) ON DELETE CASCADE
);
