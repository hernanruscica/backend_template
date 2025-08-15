INSERT INTO roles (uuid, name, description, hierarchy_level) VALUES
(UUID(), 'Owner', 'Full access to all resources and settings within a business.', 4),
(UUID(), 'Administrator', 'Can manage users, dataloggers, and alarms, but cannot delete the business or manage billing.', 3),
(UUID(), 'Technician', 'Can view and manage dataloggers and alarms.', 2),
(UUID(), 'Read-only User', 'Can only view resources but cannot make any changes.', 1);
