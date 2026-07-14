# Spec: Capa de Utils/Helpers

## 1. Proposito

Funciones utilitarias y clases base que son compartidas por todas las demas capas. Incluye manejo de errores, utilidades de base de datos, calculos matematicos, envio de emails, y manejo de fechas. Son componentes fundamentales sin los cuales ninguna otra capa funciona.

## 2. Archivos de la capa

- Ubicacion: `src/utils/*.js`
- Un archivo por responsabilidad
- Naming descriptivo: `[utilidad].js`

### Archivos actuales
- `catchAsync.js` - Wrapper para funciones async de Express
- `customError.js` - Clase CustomError con statusCode
- `dbUtils.js` - Utilidades de hashing de passwords (bcrypt)
- `dateUtils.js` - Calculos de tiempo con zona horaria
- `MathUtils.js` - Calculo de porcentaje encendido rolling
- `mail.js` - Envio de emails via Nodemailer + templates HTML
- `generateTokenAlarmLog.js` - Generacion de JWT para links de alarmas

## 3. Patrones obligatorios

### catchAsync
- Higher-order function: `(fn) => (req, res, next) => fn(req, res, next).catch(next)`
- Envuelve funciones async de Express para capturar errores automaticamente
- Los errores capturados se pasan al errorHandler via `next(error)`
- TODO controller handler debe usar esta funcion

### CustomError
- Clase que extiende `Error`
- Propiedades: `message` (string), `statusCode` (number), `name` (string, siempre "CustomError")
- Se lanza con `throw new CustomError("mensaje", statusCode)`
- El errorHandler la convierte en respuesta JSON

### dbUtils (hashing)
- Funcion `hashPassword(password)`: hashea con bcrypt (salt rounds: 10)
- Funcion `comparePassword(password, hash)`: compara password con hash
- Retorna promesas que resuelven a string (hash) o boolean (match)

### dateUtils
- Funcion `getSecondsSince(dateString)`: calcula segundos desde una fecha
- Ajusta automaticamente por zona horaria (Argentina, UTC-3)
- Retorna numero de segundos transcurridos

### MathUtils
- Funcion para calcular porcentaje de tiempo encendido en ventana rolling
- Recibe array de mediciones y ventana de tiempo
- Retorna porcentaje (0-100)

### mail.js
- Transport Nodemailer configurado con SMTP Hostinger (SSL, puerto 465)
- Funciones: `sendMessage()` (alertas de alarma), `sendActivation()` (activacion de cuenta)
- Templates HTML responsive con estilos inline
- Maneja errores de envio y retorna success/failure

### generateTokenAlarmLog
- Genera JWT con payload de alarm log para links de notificacion
- Expiracion: 24 horas
- Usa el mismo JWT_SECRET que la autenticacion principal

## 4. Dependencias

### Hacia que capas depende
- Ninguna. Esta es la capa mas basica.

### Que capas dependen de esta
- **Controllers** (spec 03): `catchAsync`
- **Services** (spec 04): `CustomError`, `mail`, `loggerService`, `dateUtils`, `dbUtils`
- **Models** (spec 05): `CustomError` para errores de MySQL
- **Middlewares** (spec 02): `CustomError` para errores de autenticacion/autorizacion
- **Jobs** (spec 07): `mail` para notificaciones

## 5. Convenciones especificas

- Las utils son funciones puras o clases sin estado global
- No dependen de Express, req, ni res
- No acceden a la base de datos directamente (excepto logging)
- Son reutilizables por cualquier capa
- Los templates de email estan en el mismo archivo que el transport
- Las utils de hashing usan bcrypt con salt rounds fijo (10)

## 6. Reglas de negocio transversales

### Seguridad
- bcrypt salt rounds: 10 (balance seguridad/rendimiento)
- JWT expiry: 1h para auth, 24h para alarm links
- Passwords: min 8 chars, 1 digito, 1 minuscula, 1 mayuscula

### Timezone
- Todos los calculos de tiempo ajustan a Argentina (UTC-3)
- La zona horaria esta hardcoded en dateUtils

### Email
- Solo se envian emails desde services (no desde controllers ni models)
- Los emails de alarma incluyen link directo al alarm log via JWT
- Los emails de activacion incluyen link para setup de password

## 7. Como extender esta capa

### Para agregar nueva utilidad

1. Crear archivo `src/utils/[utilidad].js`
2. Definir funciones puras o clase
3. No depende de Express ni de la DB
4. Exportar funciones/clase
5. Importar en las capas que la necesiten

### Para agregar template de email

1. Crear funcion en `mail.js` o archivo separado
2. Definir template HTML responsive con estilos inline
3. Usar Nodemailer transport existente
4. Manejar errores de envio

### Checklist de verificacion
- [ ] La utilidad es reutilizable (no depende de contexto especifico)
- [ ] No accede a req/res ni a la DB
- [ ] Usa parameterized queries si accede a datos
- [ ] Los errores se manejan apropiadamente
- [ ] Los templates HTML son responsive

## 8. Errores comunes de esta capa

- No usar catchAsync en controllers (causa unhandled promise rejection)
- Hardcodear salt rounds de bcrypt en multiples archivos
- No ajustar timezone en calculos de fecha
- Enviar emails desde controllers en vez de services
- No manejar errores de Nodemailer
- Hardcodear secrets en vez de usar variables de entorno
