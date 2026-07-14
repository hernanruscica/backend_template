# Spec: Capa de Models

## 1. Proposito

Capa de acceso a datos. Encapsula todas las interacciones con la base de datos MySQL. Usa SQL raw parameterized a traves de connection pools. Define la estructura de tablas, relaciones, y operaciones CRUD. Es la capa mas cercana a la persistencia.

## 2. Archivos de la capa

- Ubicacion: `src/models/*.js`
- Un archivo por dominio de entidad
- Naming: `[entity]Model.js` (camelCase)

### Archivos actuales
- `BaseModel.js` - Factory generico de CRUD models
- `userModel.js` - Modelo de usuarios (custom, no usa BaseModel)
- `businessModel.js` - Modelo de negocios (custom, no usa BaseModel)
- `roleModel.js` - Modelo de roles y permisos (custom)
- `DataloggerModel.js` - Modelo de dataloggers (extiende BaseModel)
- `ChannelModel.js` - Modelo de canales (extiende BaseModel + custom findAll)
- `AlarmModel.js` - Modelo de alarmas (extiende BaseModel + custom queries)
- `AlarmLogModel.js` - Modelo de logs de alarma (extiende BaseModel + agregaciones)
- `SolutionModel.js` - Modelo de soluciones (extiende BaseModel + custom queries)
- `UserAlarmModel.js` - Asociaciones usuario-alarma (extiende BaseModel)
- `UserBusinessModel.js` - Asociaciones usuario-negocio (extiende BaseModel)
- `MaintenanceLogModel.js` - Modelo de mantenimiento (extiende BaseModel + custom queries)
- `BackendLogModel.js` - Modelo de logs del sistema (custom)
- `dataModel.js` - Consultas de datos de sensores (raw SQL, dual-pool)

## 3. Patrones obligatorios

### BaseModel (factory function)
- Acepta `tableName` (string) y `allowedFields` (array de strings)
- Retorna objeto con metodos CRUD: `create`, `findByUuid`, `findAll`, `findAllByBusinessUuid`, `update`, `delete`, `hardDelete`
- Usa `pool` (conexion a MySQL) para ejecutar queries
- Usa `crypto.randomUUID()` para generar IDs

### Convenciones de queries
- Todas las queries usan parameterized queries (`?` placeholders) para datos del usuario
- Los nombres de tablas y columnas se interpolan directamente (usan escapeId cuando es posible)
- Las queries de insercion usan `INSERT INTO ... SET ?`
- Las queries de actualizacion construyen `SET` dinamicamente desde allowedFields
- Las queries de eliminacion usan `UPDATE ... SET is_active = false` (soft delete)
- Las queries de hard delete usan `DELETE FROM ... WHERE uuid = ?`

### Dual Pool
- `pool` (BD principal): datos de aplicacion (users, businesses, alarms, etc.)
- `poolData` (BD de datos): datos de time-series de sensores
- Los modelos normales solo usan `pool`
- `dataModel.js` usa ambos pools segun la consulta

### Naming de columnas en DB
- snake_case en la base de datos: `business_uuid`, `is_active`, `created_at`
- camelCase en el codigo JS: `businessUuid`, `isActive`, `createdAt`
- BaseModel convierte automaticamente entre formatos en updates

### UUIDs
- Todos los registros usan `crypto.randomUUID()` como primary key
- Los UUIDs se generan en el modelo, no en el controller ni service
- Las foreign keys usan el sufijo `_uuid` (ej. `business_uuid`, `user_uuid`)

## 4. Dependencias

### Hacia que capas depende
- **Config** (spec 07): `database.js` provee los pools de conexion

### Que capas dependen de esta
- **Services** (spec 04): Acceden a datos a traves de models
- **Jobs** (spec 07): Cron jobs acceden a models para obtener datos

## 5. Convenciones especificas

- Los models no contienen logica de negocio (eso es responsabilidad de services)
- Los models no verifican autorizacion (eso es responsabilidad de services)
- Los models solo ejecutan queries y retornan resultados
- Los models manejan errores de MySQL (ER_DUP_ENTRY, ER_ROW_IS_REFERENCED_2) y los re-lanzan como CustomError
- Los modelos custom (User, Business) pueden tener queries mas complejas con JOINs

### Tablas del esquema
| Tabla | Descripcion |
|-------|-------------|
| users | Usuarios del sistema |
| businesses | Negocios/empresas |
| roles | Roles del sistema (Owner, Administrator, Technician) |
| business_users | Relacion many-to-many business-user con rol |
| role_permissions | Permisos por rol (action + entity) |
| dataloggers | Dispositivos de logging de datos |
| channels | Canales de sensores within dataloggers |
| alarms | Alarmas configuradas por canal |
| users_alarms | Relacion many-to-many usuario-alarma |
| alarm_logs | Registro de disparos de alarma |
| solutions | Soluciones asociadas a alarm logs |
| maintenance_logs | Registros de mantenimiento programado |
| backend_logs | Logs del sistema |

## 6. Reglas de negocio transversales

### Multi-tenant
- Cada modelo tenant-scoped tiene `findAllByBusinessUuid(uuid)` que filtra por business
- Las foreign keys a businesses usan `business_uuid`
- Las queries de listado pueden filtrar por business

### Soft delete
- Por defecto, `delete()` ejecuta `UPDATE SET is_active = false`
- `hardDelete()` ejecuta `DELETE FROM` fisico
- Los modelos pueden tener campos `is_active` para filtrado

### Auditoria
- Los campos `created_by` y `updated_by` se setean en create/update
- Los campos `created_at` y `updated_at` se setean automaticamente

## 7. Como extender esta capa

### Para entidad simple (CRUD estandar)

1. Crear archivo `src/models/[entity]Model.js`
2. Importar BaseModel y pool
3. Definir `tableName` y `allowedFields`
4. Crear modelo usando `BaseModel(tableName, allowedFields)`
5. Exportar el objeto

### Para entidad con queries personalizadas

1. Crear archivo standalone o extender BaseModel
2. Importar pool y CustomError
3. Definir metodos adicionales con queries custom
4. Usar parameterized queries para datos del usuario
5. Manejar errores de MySQL y re-lanzar como CustomError

### Para entidad que usa ambos pools (time-series)

1. Importar ambos pools: `pool` y `poolData`
2. Usar `pool` para datos de aplicacion
3. Usar `poolData` para datos de sensores
4. Documentar cual pool se usa para cada metodo

### Checklist de verificacion
- [ ] Todas las queries usan parameterized queries para datos del usuario
- [ ] Los nombres de tablas/columnas usan snake_case
- [ ] Los UUIDs se generan con crypto.randomUUID()
- [ ] Los errores de MySQL se manejan y re-lanzan como CustomError
- [ ] BaseModel se usa cuando la entidad tiene CRUD estandar
- [ ] Las foreign keys usan sufijo `_uuid`

## 8. Errores comunes de esta capa

- Interpolar datos del usuario directamente en queries (SQL injection)
- No manejar ER_DUP_ENTRY (error de duplicacion)
- No manejar ER_ROW_IS_REFERENCED_2 (foreign key violation)
- Usar `pool.query()` en vez de `pool.execute()` (prepared statements)
- No filtrar por businessUuid en entidades multi-tenant
- Generar IDs en el controller o service en vez del model
- Poner logica de negocio en el model
