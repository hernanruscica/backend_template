
INSERT INTO solutions (uuid, business_uuid, event_uuid, name, description, user_id, is_active, created_at, created_by) VALUES

-- Solución para el Evento 1: Fallo de transmisión en Guemes
-- Usuario: Juan Carlos | Business: Guemes
('sol-001-guemes-reboot', '6a541cec-0733-4dfc-8f66-79c2ec6bf02e', 'evt-guemes-fail-001', 'Reinicio remoto de Datalogger', 'Se detectó que el equipo estaba colgado. Se procedió a realizar un reinicio forzado mediante el comando SMS. La transmisión se restableció correctamente.', 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', true, NOW() - INTERVAL 1 DAY, 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),

-- Agregamos una SEGUNDA solución al mismo evento 'evt-guemes-fail-001'
-- Usuario: Norberto ('4d5e6f7a...') | Business: Guemes
-- Notar que usamos el MISMO event_uuid que la solución anterior de Juan

-- INSERT INTO solutions (uuid, business_uuid, event_uuid, name, description, user_id, is_active, created_at, created_by) VALUES
('sol-004-guemes-cables', '6a541cec-0733-4dfc-8f66-79c2ec6bf02e', 'evt-guemes-fail-001', 'Verificación física de cableado', 'Adicional al reinicio, fui al sitio y encontré el cable de red flojo. Se reemplazó ficha RJ45.', '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90', true, NOW() - INTERVAL 20 HOUR, 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),

-- Solución para el Evento 3: Compresor 1 Quilmes (Alto consumo)
-- Usuario: Norberto | Business: Quilmes
('sol-002-quilmes-mant', '5f430bdb-9622-4c1b-9e55-68b1db5ae91d', 'evt-quilmes-comp-003', 'Limpieza de filtros de aire', 'El alto consumo se debía a la obstrucción en la entrada de aire. Se realizó limpieza y el amperaje bajó a niveles normales (42A).', '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90', true, NOW() - INTERVAL 4 HOUR, 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),

-- Solución para el Evento 5: Temperatura Gabinetes Guemes
-- Usuario: Marcelo | Business: Guemes
('sol-003-guemes-fan', '6a541cec-0733-4dfc-8f66-79c2ec6bf02e', 'evt-guemes-temp-005', 'Reemplazo de cooler', 'El cooler de extracción del gabinete estaba trabado. Se reemplazó por uno nuevo y la temperatura bajó rápidamente.', '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', true, NOW() - INTERVAL 5 MINUTE, 'e1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');

-- NOTA:
-- El evento 'evt-mdv-cafe-002' (Cafetera) y 'evt-hco-pump-004' (Bomba HCO) 
-- quedan deliberadamente SIN solución para pruebas de "incidentes abiertos".