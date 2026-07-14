# Spec: Capa de Controllers

## 1. Proposito

Capa intermedia entre routes/middlewares y services. Recibe las requests HTTP, extrae parametros y body, delega la logica de negocio al service correspondiente, y formatea la respuesta HTTP. Los controllers no contienen logica de negocio ni acceden directamente a la base de datos.

## 2. Archivos de la capa

- Ubicacion: `src/controllers/*.js`
- Un archivo por dominio de entidad
- Naming: `[entity]Controller.js` (camelCase)

### Archivos actuales
- `BaseController.js` - Factory generico de CRUD controllers
- `authController.js` - Login, activacion de usuarios (standalone)
- `userController.js` - CRUD de usuarios (standalone)
- `businessController.js` - CRUD de negocios (standalone)
- `dataController.js` - Consultas de datos de sensores (standalone)
- `DataloggerController.js` - CRUD de dataloggers (usa BaseController)
- `ChannelController.js` - CRUD de canales (usa BaseController)
- `AlarmController.js` - CRUD de alarmas (usa BaseController)
- `AlarmLogController.js` - CRUD de logs de alarma (usa BaseController)
- `SolutionController.js` - CRUD de soluciones (usa BaseController)
- `UserAlarmController.js` - Asociaciones usuario-alarma (usa BaseController)
- `UserBusinessController.js` - Asociaciones usuario-negocio (usa BaseController)
- `MaintenanceLogController.js` - Logs de mantenimiento (usa BaseController)
- `BackendLogController.js` - Logs del sistema (standalone)

## 3. Patrones obligatorios

### BaseController (factory function)
- Acepta un service como parametro
- Retorna objeto con handlers: `create`, `getAll`, `getByUuid`, `updateByUuid`, `deleteByUuid`
- Cada handler es una funcion async envuelta en `catchAsync`
- El handler extrae parametros de `req` (params, body, query, file, user)
- Delega al service y retorna respuesta con formato `{ success: true, data: ... }`

### Controllers standalone (no usan BaseModel)
- Definen sus propias funciones async envueltas en `catchAsync`
- Pueden tener logica de orquestacion mas compleja
- Siguen el mismo patron de extraccion-delegacion-respuesta

### Convenciones de funciones
- Todas las funciones son async y usan `catchAsync`
- Extraen datos de `req.params`, `req.body`, `req.query`, `req.file`, `req.user`
- Delegan al service correspondiente
- Retornan respuesta con status code apropiado (200, 201, 204)
- No contienen queries SQL ni logica de negocio directa

### Formato de respuestas
- Create: `res.status(201).json({ success: true, data: result })`
- Read: `res.status(200).json({ success: true, data: result })`
- Update: `res.status(200).json({ success: true, data: result })`
- Delete: `res.status(200).json({ success: true, message: "..." })`

### Manejo de hard delete
- Los controllers que soportan hard delete verifican `req.hardDelete`
- Si es true, llaman al service method de hard delete
- Si es false, llaman al service method de soft delete
- El flag `req.hardDelete` es seteado por un middleware inline en la ruta

## 4. Dependencias

### Hacia que capas depende
- **Utils** (spec 06): `catchAsync` para envolver funciones async
- **Services** (spec 04): Delegan toda la logica de negocio

### Que capas dependen de esta
- **Routes** (spec 01): Montan los handlers del controller en las rutas

## 5. Convenciones especificas

- Los controllers NUNCA acceden a la base de datos directamente
- Los controllers NUNCA contienen logica de negocio (validacion, permisos, transformacion)
- Los controllers solo extraen datos de la request y formatean la response
- Si un controller necesita multiples operaciones, orquesta llamadas a multiples services
- Los controllers no manejan errores de base de datos (eso es responsabilidad del service/model)

## 6. Reglas de negocio transversales

### Multi-tenant
- Controllers que operan sobre entidades tenant-scoped reciben `businessUuid` de `req.params`
- Lo pasan al service para filtrar resultados por negocio

### RBAC
- Los controllers no verifican permisos (eso lo hace permissionMiddleware)
- Los controllers confian en que `req.user` esta correctamente seteado

### Archivos
- Si hay upload, el controller lee `req.file.path` (URL de Cloudinary)
- La URL se guarda en el campo correspondiente de la entidad

## 7. Como extender esta capa

### Para entidad simple (CRUD estandar)

1. Crear archivo `src/controllers/[entity]Controller.js`
2. Importar `BaseController` y `catchAsync`
3. Importar el service de la entidad
4. Crear controller usando `BaseController(service)`
5. Exportar el objeto con los handlers

### Para entidad con logica especial

1. Crear archivo standalone sin usar BaseController
2. Importar `catchAsync` y los services necesarios
3. Definir funciones async para cada operacion
4. Envolver cada funcion en `catchAsync`
5. Exportar las funciones

### Checklist de verificacion
- [ ] Todas las funciones son async y usan catchAsync
- [ ] No hay queries SQL en el controller
- [ ] No hay logica de negocio en el controller
- [ ] Las respuestas usan formato `{ success: true/false, data/message }`
- [ ] Se maneja req.hardDelete para delete cuando aplica
- [ ] Se extraen todos los parametros necesarios de req

## 8. Errores comunes de esta capa

- Poner logica de negocio en el controller (debe estar en el service)
- Acceder a la base de datos desde el controller
- No usar catchAsync (causa unhandled promise rejection)
- Retornar respuestas con formato inconsistente
- Olvidar manejar el caso de hard delete
- No extraer businessUuid de req.params cuando es necesario
