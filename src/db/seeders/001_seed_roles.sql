INSERT INTO roles (uuid, name, description, hierarchy_level) VALUES
('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Owner', 'Full access to all resources and settings within a business.', 4),
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Administrator', 'Can manage users, dataloggers, and alarms, but cannot delete the business or manage billing.', 3),
('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'Technician', 'Can view and manage dataloggers and alarms.', 2),
('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80', 'Read-only User', 'Can only view resources but cannot make any changes.', 1);
