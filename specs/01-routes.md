# Spec: Capa de Rutas (Routes)

## 1. Proposto

Define como se exponen los endpoints REST de la aplicacion. Es la capa de entrada que conecta HTTP con el middleware chain y los controllers. Responsable de la estructura de URLs, la asignacion de middlewares por ruta, y la organizacion de los verbos HTTP.

## 2. Archivos de la capa

- Ubicacion: `src/routes/*.js`
- Un archivo por dominio de entidad (ej. `userRoutes.js`, `alarmRoutes.js`)
- Naming: `[entity]Routes.js` (camelCase)

## 3. Patrones obligatorios

### Estructura de archivos
- Cada archivo exporta un `Router` de Express
- Se usa `router.route()` para agrupar verbos sobre el mismo path
- Los imports van en orden: express-router, middlewares, controllers, validaciones

### Naming de endpoints
- Recursos en plural: `/businesses`, `/users`, `/channels`, `/alarms`
- IDs en la URL: `/:uuid` (nunca `/:id`)
- Sub-recursos anidados: `/businesses/:businessUuid/users/:uuid`
- Acciones especiales al final: `/:uuid/hard` (hard delete), `/:uuid/image` (upload)

### Verbos HTTP
- `GET` - Lectura (listar uno o muchos)
- `POST` - Creacion
- `PUT` - Actualizacion completa o parcial
- `DELETE` - Soft delete (por defecto)
- `DELETE` con sufijo `/hard` - Hard delete

### Middlewares por defecto en rutas protegidas
Toda ruta que no sea auth debe tener en este orden:
1. `authMiddleware` - Verificacion JWT
2. `permissionMiddleware` - Verificacion RBAC
3. (Opcional) validaciones especificas de la entidad
4. Controller handler

### Estructura de respuesta
Todas las respuestas usan el formato estandar:
- Exito: `{ success: true, data: {...} }` o `{ success: true, message: "..." }`
- Error: `{ success: false, message: "..." }` o `{ success: false, errors: [...] }`

## 4. Dependencias

### Hacia que capas depende
- **Middlewares** (spec 02): authMiddleware, permissionMiddleware, validaciones, upload
- **Controllers** (spec 03): handlers que procesan la request

### Que capas dependen de esta
- Ninguna. Esta es la capa mas externa.

## 5. Convenciones especificas

- Las rutas NUNCA contienen logica de negocio directamente
- Las rutas NUNCA acceden a la base de datos directamente
- El scope por businessUuid se maneja via URL params, no via query params
- Los archivos de rutas no exportan logica, solo el Router montado
- Los verbos de hard delete van siempre despues del soft delete en el archivo

## 6. Reglas de negocio transversales

### Multi-tenant
- Todo recurso (excepto businesses) esta scopeado bajo `/businesses/:businessUuid/`
- El businessUuid es obligatorio en la URL para estos recursos

### RBAC
- Todas las rutas protegidas pasan por permissionMiddleware
- Las rutas de auth (`/api/auth/*`) no requieren autenticacion

### Archivos
- Upload de archivos usa `upload.single('image')` como middleware antes del controller
- Solo se permiten: jpg, jpeg, png, webp; maximo 10MB

## 7. Como extender esta capa

### Para agregar una nueva entidad

1. Crear archivo `src/routes/[entity]Routes.js`
2. Importar Router de express
3. Importar middlewares necesarios (auth, permission, validacion si aplica)
4. Importar controller correspondiente
5. Definir rutas con `router.route()` siguiendo el patron REST
6. Montar en `src/app.js` bajo el prefijo `/api`
7. Verificar que la URL sigue el patron `/businesses/:businessUuid/[entities]/` si es recurso tenant-scoped

### Checklist de verificacion
- [ ] Nombre del archivo sigue `[entity]Routes.js`
- [ ] Todos los endpoints protegidos tienen authMiddleware + permissionMiddleware
- [ ] URLs en plural con uuid params
- [ ] Hard delete tiene sufijo `/hard`
- [ ] No hay logica de negocio en las rutas
- [ ] El router esta montado en app.js

## 8. Errores comunes de esta capa

- Montar rutas en orden incorrecto en app.js (una ruta captura请求 de otra)
- Olvidar authMiddleware en rutas que lo requieren
- Usar `/:id` en vez de `/:uuid`
- Poner logica de negocio en el route file
- No usar `router.route()` para agrupar verbos del mismo recurso
