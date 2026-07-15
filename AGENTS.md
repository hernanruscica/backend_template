# Agentes del Proyecto - Backend MDV Sensores

Definicion de agentes especializados, sus responsabilidades, las specs que consumen, y las skills que utilizan.

## Agentes disponibles

### architect

**Responsabilidad:** Diseno de especificaciones, revision de arquitectura, decisiones de alto nivel, y revision transversal de cambios.

**Specs que consume:**
- Todas (01-routes a 07-jobs)

**Skills que usa:**
- `express-crud` (para validar que el CRUD sigue el patron)
- `sql-raw-queries` (para validar queries)
- `jwt-auth` (para validar flujos de auth)
- `base-pattern-usage` (para validar composicion)

**Cundo invocar:**
- Antes de implementar una feature nueva
- Cuando hay que refactorizar un patron existente
- Cuando hay conflictos entre specs de diferentes capas
- Para revision de cambios que afectan multiples capas

**Entregable:** Spec o plan de implementacion con las capas involucradas y sus requisitos.

---

### backend-developer

**Responsabilidad:** Implementacion de controllers, services, routes, y logica de negocio estandar.

**Specs que consume:**
- 01-routes.md
- 03-controllers.md
- 04-services.md

**Skills que usa:**
- `express-crud`
- `express-validator`
- `base-pattern-usage`

**Cundo invocar:**
- Para CRUD estandar de nuevas entidades
- Para modificar endpoints existentes
- Para agregar validaciones a endpoints
- Para crear nuevos controllers con logica especial

**Entregable:** Archivos de routes, controllers, y services implementados segun spec.

---

### database-agent

**Responsabilidad:** Migraciones, seeders, queries SQL, optimizacion de base de datos, y esquema de tablas.

**Specs que consume:**
- 05-models.md

**Skills que usa:**
- `sql-raw-queries`
- `base-pattern-usage`

**Cundo invocar:**
- Para crear nuevas migraciones
- Para crear seeders
- Para optimizar queries lentas
- Para modificar el esquema de tablas
- Para crear modelos con queries complejas

**Entregable:** Archivos de migracion, seeders, y models implementados segun spec.

---

### integration-agent

**Responsabilidad:** Integraciones externas (Cloudinary, email, cron jobs), y configuracion del sistema.

**Specs que consume:**
- 07-jobs.md
- 06-utils.md

**Skills que usa:**
- `cron-jobs`
- `cloudinary-upload`
- `email-templates`

**Cundo invocar:**
- Para crear nuevos cron jobs
- Para modificar templates de email
- Para configurar uploads de archivos
- Para integrar nuevos servicios externos
- Para modificar el pipeline de datos IoT

**Entregable:** Jobs, utils, y configuraciones implementadas segun spec.

---

### security-agent

**Responsabilidad:** Autenticacion, autorizacion (RBAC), validacion de entrada, hardening, y proteccion CSRF.

**Specs que consume:**
- 02-middlewares.md

**Skills que usa:**
- `jwt-auth`
- `express-validator`
- `rbac-permissions`

**Cundo invocar:**
- Para agregar nuevos middlewares de seguridad
- Para modificar la matriz de permisos RBAC
- Para agregar validaciones a endpoints
- Para revisar vulnerabilidades de seguridad
- Para modificar el flujo de autenticacion

**Entregable:** Middlewares, validaciones, y configuraciones de seguridad implementadas segun spec.

---

### iot-agent

**Responsabilidad:** Logica de alarmas, strategies de evaluacion, data store, data model, y pipeline de datos IoT.

**Specs que consume:**
- 04-services.md
- 05-models.md
- 07-jobs.md

**Skills que usa:**
- `alarm-strategy`
- `mathjs-conditions`
- `base-pattern-usage`
- `sql-raw-queries`

**Cundo invocar:**
- Para crear nuevos tipos de alarmas (strategies)
- Para modificar el pipeline de datos
- Para optimizar queries de time-series
- Para modificar el DataloggersDataStore o EnergyIncidentsCache
- Para agregar nuevas condiciones de evaluacion
- Para modificar el pipeline de mantenimiento o sus alertas

**Entregable:** Strategies, services, models, stores (DataloggersDataStore, EnergyIncidentsCache), y jobs (MaintenanceAlertJob) del pipeline IoT implementados segun spec.

---

### testing-agent

**Responsabilidad:** Tests unitarios e integracion, validacion de specs, y verificacion de cambios.

**Specs que consume:**
- Todas (01-routes a 07-jobs)

**Skills que usa:**
- `jest-testing`
- Todas las skills de las specs que valida

**Cundo invocar:**
- Despues de implementar cualquier cambio
- Para validar que un cambio cumple con su spec
- Para crear tests para nuevo codigo
- Para ejecutar la suite de tests existente

**Entregable:** Tests unitarios y de integracion que cubren el cambio realizado.

---

## Reglas generales

### Acceso a specs
- Cada agente DEBE leer la(s) spec(s) relevante(s) antes de implementar
- Las specs son la fuente de verdad para patrones y convenciones
- Si una spec no cubre un caso, consultar al architect

### Validacion contra specs
- Antes de entregar un cambio, el agente verifica que cumple con la spec
- El testing-agent valida formalmente contra la spec
- Si el cambio viola la spec, se debe actualizar la spec primero

### Flujo de revision entre agentes
```
architect (define spec) -> backend-developer (implementa) -> testing-agent (valida)
```

## Flujo tipico de una feature

### Feature nueva (ej. nueva entidad CRUD)

1. **architect**: Define el flujo de datos y que capas participan
2. **database-agent**: Crea migracion y modelo (05-models)
3. **backend-developer**: Crea service (04-services), controller (03-controllers), route (01-routes)
4. **security-agent**: Agrega validaciones si aplica (02-middlewares)
5. **testing-agent**: Crea tests para cada capa
6. **architect**: Revision final contra specs

### Feature de integracion (ej. nuevo cron job)

1. **architect**: Define el flujo y schedule
2. **integration-agent**: Crea el job (07-jobs) y utils necesarios (06-utils)
3. **backend-developer**: Crea service si la logica lo requiere (04-services)
4. **testing-agent**: Crea tests de integracion

### Feature de seguridad (ej. nuevo permiso RBAC)

1. **architect**: Define la matriz de permisos
2. **security-agent**: Actualiza permissionMiddleware (02-middlewares)
3. **testing-agent**: Valida la matriz contra tests
