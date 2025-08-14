-- This script assumes that the roles and permissions have been seeded already.
-- It uses the names of the roles and permissions to get their IDs and create the relationships.

-- Owner permissions (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'Owner'),
    p.id
FROM permissions p;

-- Administrator permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'Administrator'),
    p.id
FROM permissions p
WHERE p.name IN (
    'view_business_dashboard',
    'edit_business_settings',
    'view_users',
    'invite_users',
    'remove_users',
    'manage_user_roles',
    'view_dataloggers',
    'create_dataloggers',
    'edit_dataloggers',
    'delete_dataloggers',
    'view_alarms',
    'create_alarms',
    'edit_alarms',
    'delete_alarms',
    'acknowledge_alarms',
    'view_reports'
);

-- Technician permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'Technician'),
    p.id
FROM permissions p
WHERE p.name IN (
    'view_business_dashboard',
    'view_dataloggers',
    'edit_dataloggers',
    'view_alarms',
    'acknowledge_alarms',
    'view_reports'
);

-- Read-only User permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'Read-only User'),
    p.id
FROM permissions p
WHERE p.name IN (
    'view_business_dashboard',
    'view_dataloggers',
    'view_alarms',
    'view_reports'
);
