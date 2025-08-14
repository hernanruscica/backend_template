INSERT INTO permissions (uuid, name, description) VALUES
-- Business related permissions
(UUID(), 'view_business_dashboard', 'Can view the main dashboard of the business.'),
(UUID(), 'edit_business_settings', 'Can edit the business details, such as name, address, etc.'),
(UUID(), 'delete_business', 'Can delete the entire business.'),

-- User management permissions
(UUID(), 'view_users', 'Can view the list of users in the business.'),
(UUID(), 'invite_users', 'Can invite new users to the business.'),
(UUID(), 'remove_users', 'Can remove users from the business.'),
(UUID(), 'manage_user_roles', 'Can change the roles of users in the business.'),

-- Datalogger permissions
(UUID(), 'view_dataloggers', 'Can view the list of dataloggers.'),
(UUID(), 'create_dataloggers', 'Can add new dataloggers.'),
(UUID(), 'edit_dataloggers', 'Can edit the settings of dataloggers.'),
(UUID(), 'delete_dataloggers', 'Can delete dataloggers.'),

-- Alarm permissions
(UUID(), 'view_alarms', 'Can view the list of alarms.'),
(UUID(), 'create_alarms', 'Can create new alarms.'),
(UUID(), 'edit_alarms', 'Can edit existing alarms.'),
(UUID(), 'delete_alarms', 'Can delete alarms.'),
(UUID(), 'acknowledge_alarms', 'Can acknowledge triggered alarms.'),

-- Reporting permissions
(UUID(), 'view_reports', 'Can view and generate reports.');
