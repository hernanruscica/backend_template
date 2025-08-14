INSERT INTO roles (uuid, name, description) VALUES
(UUID(), 'Owner', 'Full access to all resources and settings within a business.'),
(UUID(), 'Administrator', 'Can manage users, dataloggers, and alarms, but cannot delete the business or manage billing.'),
(UUID(), 'Technician', 'Can view and manage dataloggers and alarms.'),
(UUID(), 'Read-only User', 'Can only view resources but cannot make any changes.');
