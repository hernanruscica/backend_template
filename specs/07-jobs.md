# Spec: Capa de Jobs/Cron/Stores

## 1. Proposito

Tareas programadas que se ejecutan automaticamente sin interaccion del usuario. Incluye la ingesta de datos de sensores, evaluacion de alarmas, alertas de mantenimiento, y el store en memoria para datos de alto frecuencia. Es la capa que mantiene el sistema vivo y reactivo.

## 2. Archivos de la capa

### Jobs (tareas programadas)
- Ubicacion: `src/jobs/*.js`
- Naming: `[nombre]Job.js`

#### Archivos actuales
- `DataloggerDataReceiveJob.js` - Cada 5 minutos: fetch datos de sensores + evaluar alarmas
- `MaintenanceAlertJob.js` - Diario a las 1am: verificar alertas de mantenimiento
- `alarmJob.js` - Verificacion de alarmas (no usado, reemplazado por el combinado)

### Stores (estado en memoria)
- Ubicacion: `src/stores/*.js`
- Naming: `[nombre]Store.js`

#### Archivos actuales
- `DataloggersDataStore.js` - Cache en memoria de datos de dataloggers y canales (lastData, totalData, lastConection)
- `ChannelMetadataStore.js` - Cache en memoria de metadatos de canal (table_name, column_name, name, averaging_period)
- `EnergyIncidentsCache.js` - Cache con TTL de 5 min para resultados de energyincidents
  - Key: `${dataloggerUuid}:${start}:${end}`
  - TTL: 5 minutos
  - Cleanup: cada 10 minutos

### Config de DB
- Ubicacion: `src/config/*.js`
- Naming: `[servicio].js`

#### Archivos actuales
- `database.js` - Dos pools de conexion MySQL (app + sensor data)
- `cloudinary.js` - Configuracion de Cloudinary

## 3. Patrones obligatorios

### Estructura de un Job
- Usa `node-cron` para definir schedule
- Tiene flag `isRunning` para prevenir ejecucion concurrente
- Al iniciar, verifica que no este ya corriendo
- Si falla, loguea el error pero no crashea el proceso
- Se inicia desde `index.js` al arrancar el servidor

### Schedule actual
- DataloggerDataReceiveJob: `*/5 * * * *` (cada 5 minutos)
- MaintenanceAlertJob: `0 1 * * *` (diario a las 1am)
- Initial run: `checkMaintenanceAlerts()` se ejecuta al boot

### Concurrency guard
```javascript
let isRunning = false;

async function runJob() {
  if (isRunning) return;
  isRunning = true;
  try {
    // ... logica del job
  } finally {
    isRunning = false;
  }
}
```

### Pipeline de datos (DataloggerDataReceiveJob)
1. Fetch todos los dataloggers activos de la DB
2. Fetch todos los canales activos de la DB
3. **Cargar metadatos de canal en ChannelMetadataStore** (table_name, column_name, etc.)
4. Procesar canales en **batches de 3** (no todos en paralelo)
5. Para cada batch: query ultimo porcentaje de uso + query tiempo total de uso (cache 24h)
6. Procesar dataloggers en **batches de 3**: query ultima conexion
7. Almacenar todo en DataloggersDataStore
8. Ejecutar AlarmMonitorService.checkAlarms()

### Batch processing (patron de concurrencia)
- Los items se procesan en batches de `BATCH_SIZE = 3`
- Cada batch se ejecuta en paralelo via `Promise.allSettled`
- Los batches se ejecutan secuencialmente (uno a la vez)
- Esto reduce la carga concurrente de N queries a 3 queries simultaneas
- Patron: `processBatches(items, processFn)` es una funcion generica reutilizable

### Connection pool config (Hostinger Shared)
- `pool` (app DB): connectionLimit = 10, connectTimeout = 10s
- `poolData` (sensor DB): connectionLimit = 5, connectTimeout = 5s, idleTimeout = 30s
- Hostinger Shared tiene limites estrictos de conexiones concurrentes
- Reducir connectionLimit previene crash de MySQL por exceso de conexiones

### Pipeline de alarma (AlarmMonitorService)
1. Fetch todas las alarmas activas de la DB
2. Para cada alarma: obtener estrategia via StrategyFactory
3. Estrategia evalua condition_logic contra datos del store usando mathjs
4. AlarmStateService maneja cambio de estado
5. Si cambio: actualizar DB, buscar usuarios suscriptos, enviar emails, crear alarm_logs

### DataloggersDataStore (in-memory)
- Objeto global key-value, key = dataloggerUuid
- Cache: datos de canales (lastData, totalData), timestamps de conexion
- TTL: totalData se recarga cada 24 horas
- Actualizado por DataloggerDataReceiveService
- Leido por estrategias de alarma

### ChannelMetadataStore (in-memory)
- Map nativo de JS, key = channelUuid
- Cache: table_name, column_name, name, averaging_period
- TTL: se invalida cuando el cron job carga datos (cada 5 min) o cuando se actualiza un canal
- Poblado por DataloggerDataReceiveService al inicio de loadData()
- Leido por DataService para queries de time-series
- Invalidado por ChannelService en update/delete

### MaintenanceAlertJob
1. Fetch todos los canales y dataloggers
2. Para cada canal: obtener tiempo total de uso
3. Para cada maintenance log del canal:
   - Verificar si scheduled_date es hoy OR time_usage threshold excedido
   - Verificar cooldown (12h desde ultima notificacion)
   - Si condiciones se cumplen: enviar emails a Admin/Tech
   - Marcar notificacion enviada

## 4. Dependencias

### Hacia que capas depende
- **Services** (spec 04): DataloggerDataReceiveService, AlarmMonitorService, AlarmStateService
- **Models** (spec 05): Para fetch de datos de DB
- **Stores** (spec 07): DataloggersDataStore para cache
- **Config** (spec 07): database.js para pools de conexion

### Que capas dependen de esta
- **index.js** (entry point): Inicia los jobs al arrancar el servidor
- **Services** (spec 04): AlarmMonitorService y AlarmStateService son invocados por jobs

## 5. Convenciones especificas

- Los jobs no deben crashear el proceso principal (try/catch + finally)
- Los jobs deben usar concurrency guards para evitar ejecucion paralela
- El store en memoria es global (globalThis o modulo singleton)
- Los jobs se inician desde index.js, no desde app.js
- Los jobs pueden ejecutar services directamente (no necesitan controllers)
- Los schedules se definen como strings de cron estandar

## 6. Reglas de negocio transversales

### Ciclo de vida de datos IoT
```
DB remota -> DataloggerDataReceiveJob -> DataloggersDataStore -> AlarmMonitorService -> AlarmStateService -> email + alarm_logs
```

### Concurrency
- Solo una instancia del job puede correr a la vez
- Si un job toma mas tiempo que el schedule, se salta la siguiente ejecucion
- El flag `isRunning` se resetea en el bloque `finally`
- Los items se procesan en batches de 3 (no todos en paralelo) para no agotar el pool de conexiones
- Hostinger Shared: connectionLimit = 5 para poolData, connectTimeout = 5s

### Cache
- DataloggersDataStore tiene TTL para datos de largo plazo
- Los datos de corto plazo (lastData) se actualizan en cada ejecucion
- Los datos de largo plazo (totalData) se recargan cada 24h

## 7. Como extender esta capa

### Para agregar nuevo job

1. Crear archivo `src/jobs/[nombre]Job.js`
2. Definir schedule con `node-cron`
3. Implementar concurrency guard con flag `isRunning`
4. Implementar logica del job usando services existentes
5. Manejar errores con try/catch + finally (reset isRunning)
6. Importar y iniciar en `index.js`
7. Agregar log via loggerService

### Para agregar nuevo store en memoria

1. Crear archivo `src/stores/[nombre]Store.js`
2. Definir objeto de estado (singleton o globalThis)
3. Implementar metodos de get/set/update
4. Implementar TTL si es necesario
5. Exportar la instancia

### Checklist de verificacion
- [ ] El job tiene concurrency guard (isRunning)
- [ ] El job maneja errores sin crashear (try/catch + finally)
- [ ] El job usa batches para queries paralelas (BATCH_SIZE = 3)
- [ ] El job se registra en index.js
- [ ] El store usa singleton o globalThis
- [ ] El store tiene TTL para datos que se vuelven obsoletos
- [ ] Los schedules son correctos y documentados
- [ ] poolData connectionLimit <= 5 para Hostinger Shared

## 8. Errores comunes de esta capa

- No usar concurrency guard (duplicacion de ejecuciones)
- No manejar errores en jobs (causa crash del servidor)
- No usar batches para queries paralelas (agota pool de conexiones en Hostinger Shared)
- connectionLimit demasiado alto para Shared hosting (causa crash de MySQL)
- Hardcodear schedules en vez de usar variables de entorno
- No tener TTL en el store (memory leak o datos stale)
- Ejecutar el job inicial antes de que la DB este lista
- No registrar logs de ejecucion de jobs
- Olvidar iniciar el job en index.js
