# Skills del Proyecto - Backend MDV Sensores

Catalogo de habilidades disponibles para los agentes. Cada skill define que hace, cuando usarla, dependencias, y convenciones que impone.

## express-crud

**Que hace:** Implementar endpoints RESTful CRUD siguiendo el patron BaseController/BaseService/BaseModel.

**Cundo usar:**
- Para crear nueva entidad con operaciones CRUD estandar
- Para modificar endpoints existentes
- Para agregar nuevas operaciones a una entidad

**Dependencias:**
- Spec 01-routes (estructura de rutas)
- Spec 03-controllers (patron BaseController)
- Spec 04-services (patron BaseService)
- Spec 05-models (patron BaseModel)

**Convenciones que impone:**
- BaseController acepta un service y retorna handlers estandar
- BaseService acepta un model y retorna metodos CRUD con auth check
- BaseModel acepta tableName y allowedFields y retorna metodos de persistencia
- Todas las funciones son async y usan catchAsync
- Las respuestas usan formato `{ success: true/false, data/message }`

**Archivos que usa:**
- `src/controllers/BaseController.js`
- `src/services/baseService.js`
- `src/models/BaseModel.js`

---

## sql-raw-queries

**Que hacer:** Escribir queries SQL parameterized con mysql2/promise.

**Cundo usar:**
- Para crear modelos con queries personalizadas
- Para optimizar queries existentes
- Para crear migraciones y seeders

**Dependencias:**
- Spec 05-models (convenciones de queries)

**Convenciones que impone:**
- Todas las queries usan `?` placeholders para datos del usuario
- Los nombres de tablas/columnas se interpolan directamente (usar escapeId)
- Los errores de MySQL se manejan y re-lanzan como CustomError
- Se usa `pool.execute()` para prepared statements
- Las tablas multi-tenant filtran por business_uuid

**Archivos que usa:**
- `src/config/database.js`
- `src/models/*.js`
- `src/db/migrations/*.sql`

---

## jwt-auth

**Que hace:** Implementar autenticacion y autorizacion basada en JWT y RBAC.

**Cundo usar:**
- Para modificar el flujo de login
- Para agregar roles o permisos
- Para modificar la verificacion JWT
- Para implementar refresh tokens (futuro)

**Dependencias:**
- Spec 02-middlewares (auth y permission middlewares)
- Spec 06-utils (CustomError, dbUtils)

**Convenciones que impone:**
- Tokens se extraen de header `Authorization: Bearer <token>`
- JWT payload incluye: uuid, roles, isOwner
- Expiry: 1h para auth, 24h para alarm links
- Owner bypassa todos los controles de permiso
- Los middlewares de auth van SIEMPRE antes que permisos

**Archivos que usa:**
- `src/middlewares/authMiddleware.js`
- `src/middlewares/permissionMiddleware.js`
- `src/middlewares/businessVerificationMiddleware.js`
- `src/controllers/authController.js`

---

## express-validator

**Que hace:** Crear chains de validacion de entrada con express-validator.

**Cundo usar:**
- Para agregar validacion a endpoints nuevos
- Para modificar reglas de validacion existentes
- Para crear middlewares de validacion para nuevas entidades

**Dependencias:**
- Spec 02-middlewares (convenciones de validacion)

**Convenciones que impone:**
- Cada entidad tiene archivo `[entity]Validation.js`
- Valida con `body()` de express-validator
- Retorna errores en formato `{ success: false, errors: [...] }`
- Se aplica como middleware array despues de permissionMiddleware
- Password: min 8, 1 digito, 1 minuscula, 1 mayuscula

**Archivos que usa:**
- `src/middlewares/userValidation.js`
- `src/middlewares/businessValidation.js`

---

## alarm-strategy

**Que hace:** Crear nuevos tipos de evaluacion de alarmas usando Strategy Pattern.

**Cundo usar:**
- Para agregar nuevo tipo de alarma
- Para modificar logica de evaluacion existente
- Para cambiar condiciones de evaluacion

**Dependencias:**
- Spec 04-services (AlarmMonitorService, StrategyFactory)
- Spec 07-jobs (pipeline de datos)

**Convenciones que impone:**
- Cada estrategia es una clase con metodo `evaluate(data)`
- La estrategia retorna `{ triggered, value, message }`
- Las estrategias leen de DataloggersDataStore (in-memory)
- Las estrategias usan mathjs para evaluar expresiones dinamicas
- Se registran en StrategyFactory con un string key

**Archivos que usa:**
- `src/services/strategies/StrategyFactory.js`
- `src/services/strategies/[Nombre]Strategy.js`
- `src/stores/DataloggersDataStore.js`

---

## mathjs-conditions

**Que hace:** Expresar condiciones de alarma como expresiones matematicas evaluables con mathjs.

**Cundo usar:**
- Para definir condiciones de evaluacion de alarmas
- Para crear nuevas expresiones de condicion
- Para modificar la logica de evaluacion de mathjs

**Dependencias:**
- Spec 04-services (strategies)

**Convenciones que impone:**
- Las condiciones se almacenan como strings en la DB (campo condition_logic)
- Se evaluan con `mathjs.evaluate()` pasando variables del contexto
- Las variables disponibles dependen de la estrategia
- Las expresiones deben ser seguras (sin side effects)

**Archivos que usa:**
- `src/services/strategies/*.js`
- `src/utils/MathUtils.js`

---

## cron-jobs

**Que hace:** Implementar tareas programadas con node-cron.

**Cundo usar:**
- Para crear nuevos cron jobs
- Para modificar schedules existentes
- Para agregar pipeline de procesamiento

**Dependencias:**
- Spec 07-jobs (convenciones de jobs)

**Convenciones que impone:**
- Usa `node-cron` para schedules
- Incluye concurrency guard (flag isRunning)
- Maneja errores sin crashear (try/catch + finally)
- Se inicia desde index.js
- Registra logs de ejecucion

**Archivos que usa:**
- `src/jobs/*.js`
- `index.js`

---

## cloudinary-upload

**Que hace:** Configurar y manejar uploads de archivos via Multer + Cloudinary.

**Cundo usar:**
- Para agregar upload a una entidad nueva
- Para modificar restricciones de upload
- Para configurar carpetas de Cloudinary

**Dependencias:**
- Spec 02-middlewares (uploadMiddleware)
- Spec 06-utils (config de Cloudinary)

**Convenciones que impone:**
- Usa multer con CloudinaryStorage
- Tipos permitidos: jpg, jpeg, png, webp
- Tamano maximo: 10MB
- La URL de Cloudinary se guarda en el campo de la entidad
- No hay almacenamiento local

**Archivos que usa:**
- `src/middlewares/uploadMiddleware.js`
- `src/config/cloudinary.js`

---

## email-templates

**Que hace:** Crear y modificar templates HTML de email para notificaciones.

**Cundo usar:**
- Para agregar nuevo tipo de email
- Para modificar templates existentes
- Para cambiar configuracion de SMTP

**Dependencias:**
- Spec 06-utils (mail.js)

**Convenciones que impone:**
- Templates HTML responsive con estilos inline
- Usa Nodemailer transport existente
- Maneja errores de envio
- Emails de alarma incluyen link JWT
- Emails de activacion incluyen link de setup

**Archivos que usa:**
- `src/utils/mail.js`

---

## base-pattern-usage

**Que hace:** Componer nuevas entidades usando BaseModel, BaseService, BaseController.

**Cundo usar:**
- Para crear nueva entidad que sigue el patron CRUD estandar
- Para validar que una entidad nueva compone correctamente las capas

**Dependencias:**
- Spec 03-controllers (BaseController)
- Spec 04-services (BaseService)
- Spec 05-models (BaseModel)

**Convenciones que impone:**
- BaseModel: `BaseModel(tableName, allowedFields)`
- BaseService: `BaseService(model)`
- BaseController: `BaseController(service)`
- Cada capa exporta un objeto con metodos/handlers
- Las capas se componnen pasando dependencias como parametros

**Archivos que usa:**
- `src/models/BaseModel.js`
- `src/services/baseService.js`
- `src/controllers/BaseController.js`

---

## jest-testing

**Que hace:** Crear y ejecutar tests unitarios e integracion con Jest + Supertest.

**Cundo usar:**
- Para crear tests para nuevo codigo
- Para ejecutar la suite de tests
- Para verificar que un cambio no rompe funcionalidad existente

**Dependencias:**
- Todas las specs (para validar contra patrones)

**Convenciones que impone:**
- Tests unitarios: `*.unit.test.js`
- Tests de integracion: `*.test.js`
- Carpeta: `__tests__/`
- Mock de DB y servicios externos
- Tests de middlewares, services, models, y controllers

**Archivos que usa:**
- `__tests__/*.test.js`
- `__tests__/*.unit.test.js`

---

## rbac-permissions

**Que hace:** Gestionar la matriz de permisos RBAC por rol y entidad.

**Cundo usar:**
- Para agregar nuevo rol
- Para modificar permisos de rol existente
- Para agregar nueva entidad a la matriz

**Dependencias:**
- Spec 02-middlewares (permissionMiddleware)

**Convenciones que impone:**
- Tres roles: Owner, Administrator, Technician
- Owner bypassa todos los controles
- La matriz mapea: rol -> entidad -> [HTTP methods]
- Los permisos se almacenan en role_permissions
- La verificacion es por business (cada business puede tener permisos distintos)

**Archivos que usa:**
- `src/middlewares/permissionMiddleware.js`
- `src/models/roleModel.js`
