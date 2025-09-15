CREATE TABLE dataloggers (
    uuid CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    mac_address VARCHAR(255) NOT NULL,
    img VARCHAR(255),
    table_name VARCHAR(255),
    business_uuid CHAR(36) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by CHAR(36),
    updated_by CHAR(36),
    FOREIGN KEY (business_uuid) REFERENCES businesses(uuid) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(uuid),
    FOREIGN KEY (updated_by) REFERENCES users(uuid)
);
