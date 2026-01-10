CREATE TABLE solutions (
    uuid CHAR(36) PRIMARY KEY,
    business_uuid CHAR(36) NOT NULL,
    event_uuid CHAR(36) NOT NULL, -- Campo Nuevo: Vincula la solución al grupo de logs
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id CHAR(36),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by CHAR(36),
    updated_by CHAR(36),
    
    FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE SET NULL,
    FOREIGN KEY (business_uuid) REFERENCES businesses(uuid) ON DELETE CASCADE,
    
    -- ÍNDICE IMPORTANTE: Acelera la búsqueda de soluciones
    INDEX idx_solutions_event (event_uuid)
);