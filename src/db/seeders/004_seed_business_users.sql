-- Link John Doe (Owner) to Tech Corp as an Owner
INSERT INTO business_users (uuid, user_uuid, business_uuid, role_uuid, created_by) VALUES
('3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');

-- Link Jane Smith (Admin) to Innovate LLC as an Administrator
INSERT INTO business_users (uuid, user_uuid, business_uuid, role_uuid, created_by) VALUES
('4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8g', 'f2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', '2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');

-- Link Mike Matei (Technician) to Innovate LLC as an Administrator
INSERT INTO business_users (uuid, user_uuid, business_uuid, role_uuid, created_by) VALUES
('5d5e4f1a-2b6c-2d1e-7f6a-8b4c9d6e7f4g', 'e1b4c3d6-e5f6-1d7c-3c9d-0e1f2a5b4c3c', '2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');