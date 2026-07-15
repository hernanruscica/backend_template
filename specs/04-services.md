# Spec: Capa de Services

## 1. Proposito

Capa central de logica de negocio. Recibe requests de controllers, aplica reglas de negocio, orquesta operaciones, verifica autorizaciones a nivel de servicio, genera logs, y delega persistencia a models. Es la capa mas densa en terminos de logica.

## 2. Archivos de la capa

- Ubicacion: `src/services/*.js`
- Un archivo por dominio de entidad
- Naming: `[entity]Service.js` (camelCase)

### Archivos actuales
- `baseService.js` - Factory generico de CRUD services
- `userService.js` - Logica de usuarios (standalone)
- `businessService.js` - Logica de negocios (standalone)
- `DataloggerService.js` - Logica de dataloggers (usa BaseService)
- `ChannelService.js` - Logica de canales (usa BaseService)
- `AlarmService.js` - Logica de alarmas (usa BaseService)
- `AlarmLogService.js` - Logica de logs de alarma (usa BaseService)
- `AlarmMonitorService.js` - Orquestador de evaluacion de alarmas (standalone)
- `AlarmStateService.js` - Maquina de estados de alarmas + notificaciones (standalone)
- `UserAlarmService.js` - Asociaciones usuario-alarma (usa BaseService)
- `UserBusinessService.js` - Asociaciones usuario-negocio (usa BaseService)
- `DataService.js` - Consultas de datos de sensores (standalone)
- `SolutionService.js` - Soluciones (usa BaseService)
- `MaintenanceLogService.js` - Logs de mantenimiento (usa BaseService)
- `DataloggerDataReceiveService.js` - Carga de datos desde DB remota (standalone)
- `BackendLogService.js` - Logs del sistema (standalone)
- `loggerService.js` - Servicio centralizado de logging (standalone)

### Subdirectorio strategies
- `strategies/StrategyFactory.js` - Mapa de tipos de alarma a estrategias
- `strategies/PorcentajeEncendidoStrategy.js` - Evaluacion por porcentaje encendido
- `strategies/FalloComunicacionStrategy.js` - Evaluacion por fallo de comunicacion
- `strategies/FuncionamientoSimultaneoStrategy.js` - Evaluacion por funcionamiento simultaneo

## 3. Patrones obligatorios

### BaseService (factory function)
- Acepta un model como parametro
- Retorna objeto con metodos: `create`, `getAll`, `getByUuid`, `updateByUuid`, `deleteByUuid`, `hardDeleteByUuid`
- Cada metodo:
  1. Verifica autorizacion del usuario (business ownership check)
  2. Ejecuta operacion en el model
  3. Registra la operacion via loggerService
  4. Retorna resultado

### Services standalone (no usan BaseService)
- Definen sus propios metodos segun la logica requerida
- Pueden orquestar multiples models y services
- Siguen el patron de verificar-logica-registrar-returned

### Convenciones de metodos
- Todos los metodos son async
- Verifican que el usuario tiene acceso al business antes de operar
- Registran la operacion via loggerService despues de completar exitosamente
- Lanzan CustomError cuando la operacion falla
- Retornan el resultado de la operacion al controller

### Manejo de errores en services
- Los errores de base de datos se capturan y convierten a CustomError
- Los errores de duplicacion (ER_DUP_ENTRY) se convierten a 409
- Los errores de foreign key (ER_ROW_IS_REFERENCED_2) se convierten a 409
- Los errores de no encontrado se convierten a 404

### Strategy Pattern (para alarmas)
- `StrategyFactory` mapea strings de tipo de alarma a clases de estrategia
- Cada estrategia implementa un metodo `evaluate(data)`
- Las estrategias leen de `DataloggersDataStore` (in-memory)
- Las estrategias usan `mathjs` para evaluar expresiones dinamicas

### Patron de Cache en DataService
- `DataService` usa `ChannelMetadataStore` (Map en memoria) para cachear metadatos de canal
- Metodo `getChannelMetadata(channelUuid)`: busca en cache, si no existe va a DB y guarda
- Los metadatos (table_name, column_name, name, averaging_period) son estaticos y se cachean indefinidamente
- El cache se invalida cuando: el cron job carga datos (cada 5 min) o se actualiza/elimina un canal
- `ChannelService` invalida el cache en update/delete/hardDelete llamando a `ChannelMetadataStore.invalidate(uuid)`
- Este patron elimina 1 query a la DB por request en los endpoints de time-series

### Patron de Cache con TTL (EnergyIncidentsCache)
- `DataService` usa `EnergyIncidentsCache` (Map con TTL) para cachear resultados de energyincidents
- Key compuesta: `${dataloggerUuid}:${start}:${end}`
- TTL: 5 minutos (300,000 ms)
- Cleanup automatico cada 10 minutos via `setInterval`
- En cache hit: 0 queries a DB
- En cache miss: ejecuta queries, guarda resultado en cache, retorna
- Invalidacion: solo por TTL (no hay invalidacion manual)

## 4. Dependencias

### Hacia que capas depende
- **Models** (spec 05): Persistencia de datos
- **Utils** (spec 06): `CustomError`, `loggerService`, `mail`, `dateUtils`
- **Stores** (spec 07): `DataloggersDataStore` para datos en memoria, `ChannelMetadataStore` para metadatos cacheados

### Que capas dependen de esta
- **Controllers** (spec 03): Delegan toda la logica de negocio
- **Jobs** (spec 07): Cron jobs invocan services para ejecutar tareas programadas

## 5. Convenciones especificas

- Los services no acceden a `req` ni `res` (son agnosticos a HTTP)
- Los services no envian respuestas HTTP (eso es responsabilidad del controller)
- Los services pueden enviar emails (via `mail.js`) cuando la logica lo requiere
- Los services pueden ejecutar queries complejas que involucren multiples models
- Los services no deben contener middleware logic

## 6. Reglas de negocio transversales

### Multi-tenant
- Todo metodo que opere sobre una entidad tenant-scoped recibe `businessUuid`
- Verifica que el usuario tiene acceso a ese business antes de operar
- Filtra resultados por businessUuid cuando es necesario

### RBAC a nivel de servicio
- Los services verifican que el usuario tiene el rol adecuado para la operacion
- El Owner bypassa todas las verificaciones
- Los Administrators pueden crear/actualizar/eliminar
- Los Technicians solo pueden leer (y put en usuarios)

### Logging
- Toda operacion de escritura (create, update, delete) se registra via loggerService
- El log incluye: usuario, accion, entidad, resultado
- Los errores tambien se registran (con stack trace si es error no controlado)

## 7. Como extender esta capa

### Para entidad simple (CRUD estandar)

1. Crear archivo `src/services/[entity]Service.js`
2. Importar `BaseService` y el model correspondiente
3. Crear service usando `BaseService(model)`
4. Exportar el objeto con los metodos

### Para entidad con logica especial

1. Crear archivo standalone sin usar BaseService
2. Importar los models y utils necesarios
3. Definir metodos para cada operacion
4. Implementar verificacion de autorizacion en cada metodo
5. Implementar logging via loggerService
6. Exportar los metodos

### Para agregar un nuevo tipo de alarma (Strategy)

1. Crear archivo `src/services/strategies/[Nombre]Strategy.js`
2. Implementar metodo `evaluate(data)` que retorne `{ triggered, value, message }`
3. Registrar en `StrategyFactory.js` el mapping tipo -> clase
4. La estrategia puede usar `mathjs` para evaluar expresiones

### Checklist de verificacion
- [ ] Todos los metodos son async
- [ ] Verifican autorizacion del usuario antes de operar
- [ ] Registran operacion via loggerService
- [ ] Lanzan CustomError en caso de fallo
- [ ] No acceden a req/res (agnosticos a HTTP)
- [ ] No envian respuestas HTTP

## 8. Errores comunes de esta capa

- No verificar autorizacion antes de operar (bypass de seguridad)
- No registrar operaciones (falta de audit trail)
- Acceder a req/res desde el service
- Capturar errores sin convertirlos a CustomError
- No manejar duplicacion de datos (ER_DUP_ENTRY)
- Olvidar filtrar por businessUuid en queries multi-tenant
