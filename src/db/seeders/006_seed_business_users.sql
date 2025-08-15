INSERT INTO business_users (uuid, user_uuid, business_uuid, role_uuid) VALUES
('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8g9h', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', (SELECT uuid FROM roles WHERE name = 'Owner')),
('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8g9h0i', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8g', (SELECT uuid FROM roles WHERE name = 'Administrator'));
