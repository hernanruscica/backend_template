# Spec: Capa de Middlewares

## 1. Proposito

Define los middlewares de Express que procesan las requests antes de llegar a los controllers. Cubre autenticacion, autorizacion, validacion de entrada, proteccion CSRF, manejo de errores, y uploads. Esta capa es transversal y afecta todas las demas capas.

## 2. Archivos de la capa

- Ubicacion: `src/middlewares/*.js`
- Un archivo por responsabilidad (auth, permisos, validacion, etc.)
- Naming descriptivo: `[responsabilidad].js`

### Archivos actuales
- `authMiddleware.js` - Verificacion JWT
- `permissionMiddleware.js` - RBAC
- `businessVerificationMiddleware.js` - Verificacion de pertenencia a negocio
- `csrfMiddleware.js` - Proteccion CSRF
- `uploadMiddleware.js` - Upload de archivos via Multer+Cloudinary
- `userValidation.js` - Validacion de datos de usuario
- `businessValidation.js` - Validacion de datos de negocio
- `errorHandler.js` - Handler global de errores
- Rate limiting global en `app.js` (`express-rate-limit`, 700 req/15min por IP)

## 3. Patrones obligatorios

### Firma de middlewares
- Todos los middlewares tienen firma `(req, res, next)`
- Si el middleware es async, debe usar catchAsync o manejar errores internamente
- Si el middleware rechaza la request, retorna error con `next(error)` o respuesta directa
- Si el middleware aprueba, llama a `next()` para continuar la cadena

### Cadena de ejecucion (order)
El orden de middlewares es critico:
```
rateLimiter -> csrfMiddleware -> authMiddleware -> permissionMiddleware -> [validacion] -> controller
```

### Middlewares de autenticacion
- Extraen token del header `Authorization: Bearer <token>`
- Verifican firma y expiracion del JWT
- Adjuntan payload decodificado a `req.user`
- Si fallan, retornan 401

### Middlewares de autorizacion (RBAC)
- Extraen la entidad del URL (ej. `/businesses/:businessUuid/users/` -> `users`)
- Buscan el rol del usuario para el business especifico en `req.user.roles`
- Verifican que el rol tiene permiso para el HTTP method sobre la entidad
- El Owner bypassa todos los controles
- Si fallan, retornan 400 (no pertenece al business) o 401 (sin permiso)

### Middlewares de validacion
- Usan `express-validator` para definir chains de validacion
- Retornan errores en formato `{ success: false, errors: [...] }`
- Se aplican solo en rutas de creacion/actualizacion

### Middlewares de upload
- Usan `multer` con `multer-storage-cloudinary`
- Validan tipo MIME y tamano maximo
- Almacenan el archivo en Cloudinary y adjuntan URL a `req.file`

## 4. Dependencias

### Hacia que capas depende
- **Utils** (spec 06): CustomError para errores
- **Models** (spec 05): UserModel para verificar existencia de usuarios (businessVerificationMiddleware)

### Que capas dependen de esta
- **Routes** (spec 01): Monta middlewares en el chain
- **Controllers** (spec 03): Recibe req.user, req.file, req.hardDelete seteados por middlewares
- **Services** (spec 04): Puede acceder a informacion seteada por middlewares

## 5. Convenciones especificas

- Los middlewares de auth y permisos son obligatorios para toda ruta protegida
- Los middlewares de validacion solo se aplican en POST y PUT
- El errorHandler va SIEMPRE como ultimo middleware en app.js
- Los middlewares no deben contener logica de negocio compleja
- Los middlewares no deben responder directamente al cliente en caso de error critico (usar next(error))
- Las excepciones CSRF se definen como lista de paths que no la requieren

## 6. Reglas de negocio transversales

### Multi-tenant
- `businessVerificationMiddleware` verifica que el usuario tiene acceso al business en la URL
- Se ejecuta DESPUES de authMiddleware y permissionMiddleware

### RBAC (matriz de permisos)
| Rol | Businesses | Users | Dataloggers | Channels | Alarms | User-Alarms | AlarmLogs |
|-----|-----------|-------|-------------|----------|--------|-------------|-----------|
| Owner | ALL | ALL | ALL | ALL | ALL | ALL | ALL |
| Administrator | GET, PUT | POST, GET, PUT, DELETE | POST, GET, PUT, DELETE | POST, GET, PUT, DELETE | POST, GET, PUT, DELETE | POST, GET, PUT, DELETE | POST, GET, PUT, DELETE |
| Technician | GET | GET, PUT | GET | GET | GET | GET | GET, PUT |

### CSRF
- Todas las rutas `/api` requieren header `X-Requested-With: XMLHttpRequest`
- Excepciones: rutas de auth (`/api/auth/*`)

### Rate Limiting
- Configurado en `app.js` con `express-rate-limit`
- 700 requests por IP en ventana de 15 minutos
- Aplica a todas las rutas `/api`
- Responde con 429 y headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`

## 7. Como extender esta capa

### Para agregar validacion a una entidad nueva

1. Crear archivo `src/middlewares/[entity]Validation.js`
2. Definir chain de validacion para create con `body()` de express-validator
3. Definir chain de validacion para update con campos opcionales
4. Exportar funcion `handleValidationErrors` que usa `validationResult(req)`
5. Importar en las rutas correspondientes y agregar despues de permissionMiddleware

### Para agregar un nuevo middleware de verificacion

1. Crear archivo con firma `(req, res, next)`
2. Si es async, envolver en try/catch y usar `next(error)`
3. Si la verificacion falla, crear CustomError con statusCode apropiado
4. Si pasa, llamar `next()`
5. Montar en las rutas correspondientes despues de authMiddleware

### Checklist de verificacion
- [ ] El middleware tiene firma `(req, res, next)`
- [ ] Errores se pasan via `next(error)` o `next(new CustomError(...))`
- [ ] El middleware no contiene logica de negocio compleja
- [ ] El orden de ejecucion es correcto (auth -> permisos -> validacion -> controller)
- [ ] Si es middleware de upload, valida MIME type y tamano

## 8. Errores comunes de esta capa

- Poner el errorHandler antes de otros middlewares en app.js
- Olvidar llamar `next()` en un middleware que aprueba
- No usar CustomError (usar Error nativo sin statusCode)
- Hardcodear permisos en vez de usar la matriz de permissionMiddleware
- No manejar errores async en middlewares (causa unhandled promise rejection)
