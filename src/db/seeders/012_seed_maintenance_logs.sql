INSERT INTO maintenance_logs (uuid, business_uuid, title, description, type, priority, status, time_usage, channel_uuid, datalogger_uuid, completed_at, completed_by, is_active, created_at, created_by, updated_at, updated_by) VALUES

-- Registro 1: Tarea de mantenimiento en un canal específico (Guemes)
-- Datalogger: f1b2c3d4-e5f6-7890-1234-567890abcdef (Datalogger Guemes)
-- Channel: 30313233-3435-3637-3839-404142434445 (Compresor 1)
('ml-001-guemes-task-001', '6a541cec-0733-4dfc-8f66-79c2ec6bf02e', 'Reemplazo de sensor de temperatura', 'Se reemplazó el sensor de temperatura del canal que estaba mostrando valores erraticos. El nuevo sensor fue calibrado correctamente.', 'task', 'high', 'completed', 120, '30313233-3435-3637-3839-404142434445', 'f1b2c3d4-e5f6-7890-1234-567890abcdef', '2025-03-15 14:30:00', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', true, '2025-03-15 12:00:00', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '2025-03-15 14:30:00', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),

-- Registro 2: Observación del datalogger sin canal asociado (Guemes)
-- Datalogger: f1b2c3d4-e5f6-7890-1234-567890abcdef (Datalogger Guemes)
-- channel_uuid es NULL porque pertenece al datalogger
('ml-002-guemes-obs-001', '6a541cec-0733-4dfc-8f66-79c2ec6bf02e', 'Observación de conexión GSM', 'Se observó que la señal GSM del datalogger principal está fluctuando. Puede deberse a interferencias o problemas con la antena externa.', 'observation', 'medium', 'pending', 15, NULL, 'f1b2c3d4-e5f6-7890-1234-567890abcdef', NULL, NULL, true, '2025-03-18 09:00:00', '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90', '2025-03-18 09:00:00', '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90'),

-- Registro 3: Reporte de mantenimiento preventivo (Quilmes)
-- Datalogger: h3d4e5f6-a7b8-9012-3456-7890abcdef12 (Sala de compresores Iriarte de Quilmes)
-- Channel: a0a1a2a3-a4a5-a6a7-a8a9-b0b1b2b3b4b5 (Compresor 1)
('ml-003-quilmes-report-001', '5f430bdb-9622-4c1b-9e55-68b1db5ae91d', 'Reporte mensual de mantenimiento', 'Se realizó el mantenimiento preventivo mensual del sistema. Todos los canales funcionando correctamente. Se actualizó el firmware del datalogger a la versión 2.3.1.', 'report', 'low', 'completed', 180, 'a0a1a2a3-a4a5-a6a7-a8a9-b0b1b2b3b4b5', 'h3d4e5f6-a7b8-9012-3456-7890abcdef12', '2025-03-10 16:00:00', '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90', true, '2025-03-10 13:00:00', '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', '2025-03-10 16:00:00', '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f');
