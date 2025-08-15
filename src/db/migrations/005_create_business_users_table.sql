CREATE TABLE business_users (
    uuid CHAR(36) PRIMARY KEY,
    user_uuid CHAR(36) NOT NULL,
    business_uuid CHAR(36) NOT NULL,
    role_uuid CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by CHAR(36),
    FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE,
    FOREIGN KEY (business_uuid) REFERENCES businesses(uuid) ON DELETE CASCADE,
    FOREIGN KEY (role_uuid) REFERENCES roles(uuid),
    UNIQUE KEY (user_uuid, business_uuid, role_uuid)
);
