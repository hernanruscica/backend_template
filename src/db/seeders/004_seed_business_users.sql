
-- -- Link John Doe (Owner) to Tech Corp as an Owner - dni: 28470359 pass: Password1234
-- INSERT INTO business_users (uuid, user_uuid, business_uuid, role_uuid, created_by) VALUES
-- ('3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');

-- -- Link Jane Smith (Admin) to Innovate LLC as an Administrator - dni: 28470361 pass: Password1234
-- INSERT INTO business_users (uuid, user_uuid, business_uuid, role_uuid, created_by) VALUES
-- ('4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8a', 'f2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', '2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');

-- -- Link Jane Smith (Technician) to Tech Corp as an Technician - dni: 28470361 pass: Password1234
-- INSERT INTO business_users (uuid, user_uuid, business_uuid, role_uuid, created_by) VALUES
-- ('4c5d6f7d-8a4a-4a0a-8f2a-3b4d5d6a7f1e', 'f2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');

-- -- Link Mike Matei (Technician) to Innovate LLC as an Technician - dni: 28470350 pass: 1298
-- INSERT INTO business_users (uuid, user_uuid, business_uuid, role_uuid, created_by) VALUES
-- ('5d5e4f1a-2b6c-4d1e-8f6a-8b4c9d6e7f4a', 'e1b4c3d6-e5f6-1d7c-3c9d-0e1f2a5b4c3c', '2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');


-- Link Marcelo Dordoni (Owner) to MDV Sensores as an Owner
INSERT INTO business_users (uuid, user_uuid, business_uuid, role_uuid, created_by) VALUES
('6e7f8a9b-0c1d-2e3f-4a5b-6c7d8e9f0a1b', '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', '4e329ada-8511-4bfa-8d44-57a0ca4fd80c', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');

-- Link Norberto Datalogger (Owner) to MDV Sensores as an Owner
INSERT INTO business_users (uuid, user_uuid, business_uuid, role_uuid, created_by) VALUES
('7f8a9b0c-1d2e-3f4a-5b6c-7d8e9f0a1b2c', '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90', '4e329ada-8511-4bfa-8d44-57a0ca4fd80c', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');

-- Link demo1 (Technician) to MDV Sensores as a Technician
INSERT INTO business_users (uuid, user_uuid, business_uuid, role_uuid, created_by) VALUES
('8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d', '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f90a1', '4e329ada-8511-4bfa-8d44-57a0ca4fd80c', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');

-- Link demo2 (Technician) to MDV Sensores as a Technician
INSERT INTO business_users (uuid, user_uuid, business_uuid, role_uuid, created_by) VALUES
('9b0c1d2e-3f4a-5b6c-7d8e-9f0a1b2c3d4e', '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f90a1b2', '4e329ada-8511-4bfa-8d44-57a0ca4fd80c', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');

-- Link demo3 (Technician) to MDV Sensores as a Technician
INSERT INTO business_users (uuid, user_uuid, business_uuid, role_uuid, created_by) VALUES
('0c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f', '7a8b9c0d-1e2f-3a4b-5c6d-7e8f90a1b2c3', '4e329ada-8511-4bfa-8d44-57a0ca4fd80c', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');

-- Link demo4 (Technician) to MDV Sensores as a Technician
INSERT INTO business_users (uuid, user_uuid, business_uuid, role_uuid, created_by) VALUES
('1d2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a', '8b9c0d1e-2f3a-4b5c-6d7e-8f90a1b2c3d4', '4e329ada-8511-4bfa-8d44-57a0ca4fd80c', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');

-- Link Fernando Olivares (Administrator) to Quilmes as an Administrator
INSERT INTO business_users (uuid, user_uuid, business_uuid, role_uuid, created_by) VALUES
('2e3f4a5b-6c7d-8e9f-0a1b-2c3d4e5f6a7b', '9c0d1e2f-3a4b-5c6d-7e8f-90a1b2c3d4e5', '5f430bdb-9622-4c1b-9e55-68b1db5ae91d', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');

-- Link Juan Carlos Perez Fernandez (Owner) to MDV Sensores as an Owner
INSERT INTO business_users (uuid, user_uuid, business_uuid, role_uuid, created_by) VALUES
('3f4a5b6c-7d8e-9f0a-1b2c-3d4e5f6a7b8c', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', '4e329ada-8511-4bfa-8d44-57a0ca4fd80c', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');
