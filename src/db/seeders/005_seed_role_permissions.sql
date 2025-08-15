-- This script assumes that the roles have been seeded already.
-- It uses the names of the roles to get their UUIDs and create the relationships.

-- Owner permissions (all permissions)
INSERT INTO role_permissions (role_uuid, action, entity)
SELECT
    (SELECT uuid FROM roles WHERE name = 'Owner'),
    action,
    entity
FROM (
    SELECT 'GET' AS action, 'businesses' AS entity
    UNION ALL SELECT 'POST', 'businesses'
    UNION ALL SELECT 'PUT', 'businesses'
    UNION ALL SELECT 'DELETE', 'businesses'
    UNION ALL SELECT 'GET', 'users'
    UNION ALL SELECT 'POST', 'users'
    UNION ALL SELECT 'DELETE', 'users'
    UNION ALL SELECT 'PUT', 'users'
    UNION ALL SELECT 'GET', 'dataloggers'
    UNION ALL SELECT 'POST', 'dataloggers'
    UNION ALL SELECT 'PUT', 'dataloggers'
    UNION ALL SELECT 'DELETE', 'dataloggers'
    UNION ALL SELECT 'GET', 'alarms'
    UNION ALL SELECT 'POST', 'alarms'
    UNION ALL SELECT 'PUT', 'alarms'
    UNION ALL SELECT 'DELETE', 'alarms'
    UNION ALL SELECT 'POST', 'alarms/acknowledge'
    UNION ALL SELECT 'GET', 'reports'
    UNION ALL SELECT 'GET', 'channels'
    UNION ALL SELECT 'POST', 'channels'
    UNION ALL SELECT 'PUT', 'channels'
    UNION ALL SELECT 'DELETE', 'channels'
) AS permissions;

-- Administrator permissions
INSERT INTO role_permissions (role_uuid, action, entity)
SELECT
    (SELECT uuid FROM roles WHERE name = 'Administrator'),
    action,
    entity
FROM (
    SELECT 'GET' AS action, 'businesses' AS entity
    UNION ALL SELECT 'PUT', 'businesses'
    UNION ALL SELECT 'GET', 'users'
    UNION ALL SELECT 'POST', 'users'
    UNION ALL SELECT 'DELETE', 'users'
    UNION ALL SELECT 'PUT', 'users'
    UNION ALL SELECT 'GET', 'dataloggers'
    UNION ALL SELECT 'POST', 'dataloggers'
    UNION ALL SELECT 'PUT', 'dataloggers'
    UNION ALL SELECT 'DELETE', 'dataloggers'
    UNION ALL SELECT 'GET', 'alarms'
    UNION ALL SELECT 'POST', 'alarms'
    UNION ALL SELECT 'PUT', 'alarms'
    UNION ALL SELECT 'DELETE', 'alarms'
    UNION ALL SELECT 'POST', 'alarms/acknowledge'
    UNION ALL SELECT 'GET', 'reports'
    UNION ALL SELECT 'GET', 'channels'
    UNION ALL SELECT 'PUT', 'channels'
) AS permissions;

-- Technician permissions
INSERT INTO role_permissions (role_uuid, action, entity)
SELECT
    (SELECT uuid FROM roles WHERE name = 'Technician'),
    action,
    entity
FROM (
    SELECT 'GET' AS action, 'businesses' AS entity
    UNION ALL SELECT 'GET', 'dataloggers'
    UNION ALL SELECT 'PUT', 'dataloggers'
    UNION ALL SELECT 'GET', 'alarms'
    UNION ALL SELECT 'POST', 'alarms/acknowledge'
    UNION ALL SELECT 'GET', 'reports'
    UNION ALL SELECT 'GET', 'channels'
) AS permissions;

-- Read-only User permissions
INSERT INTO role_permissions (role_uuid, action, entity)
SELECT
    (SELECT uuid FROM roles WHERE name = 'Read-only User'),
    action,
    entity
FROM (
    SELECT 'GET' AS action, 'businesses' AS entity
    UNION ALL SELECT 'GET', 'dataloggers'
    UNION ALL SELECT 'GET', 'alarms'
    UNION ALL SELECT 'GET', 'reports'
    UNION ALL SELECT 'GET', 'channels'
) AS permissions;
