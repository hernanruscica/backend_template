# Especificaciones por Capa - Backend MDV Sensores

Especificaciones abstractas (patrones, reglas, convenciones) de cada capa del backend. Estos documentos son **vivos** y se actualizan cuando cambia la arquitectura.

## Uso

- Cada spec define **cómo debe comportarse** su capa, sin código específico
- Los agentes leen la(s) spec(s) relevante(s) antes de implementar
- Antes de crear nueva funcionalidad, identificar qué capas participan y consultar sus specs
- Al refactorizar, actualizar la spec correspondiente como parte del cambio

## Índice de Specs

| Spec | Capa | Archivos cubiertos |
|------|------|-------------------|
| [01-routes](./01-routes.md) | Rutas REST | `src/routes/*.js` |
| [02-middlewares](./02-middlewares.md) | Middlewares | `src/middlewares/*.js` |
| [03-controllers](./03-controllers.md) | Controllers | `src/controllers/*.js` |
| [04-services](./04-services.md) | Services | `src/services/*.js` |
| [05-models](./05-models.md) | Models | `src/models/*.js` |
| [06-utils](./06-utils.md) | Utils/Helpers | `src/utils/*.js` |
| [07-jobs](./07-jobs.md) | Jobs/Cron/Stores | `src/jobs/*.js`, `src/stores/*.js` |

## Mapeo Agente -> Spec

| Agente | Specs que consume |
|--------|-------------------|
| architect | Todas (revisiones transversales) |
| backend-developer | 01-routes, 03-controllers, 04-services |
| database-agent | 05-models |
| integration-agent | 07-jobs, 06-utils |
| security-agent | 02-middlewares |
| iot-agent | 04-services, 05-models, 07-jobs |
| testing-agent | Todas (tests por capa) |

## Flujo de implementacion de una nueva feature

1. El architect define el flujo de datos y que capas participan
2. Se consultan las specs de cada capa involucrada
3. Se implementa capa por capa (models -> services -> controllers -> routes)
4. Se implementan middlewares transversales si aplica
5. El testing-agent valida contra las specs
6. Si la feature introduce un patron nuevo, se actualiza la spec correspondiente

## Reglas globales

- Todo endpoint REST debe seguir el patron CRUD de la spec 01-routes
- Todo modelo debe usar BaseModel cuando sea posible (spec 05-models)
- Toda operacion async en controllers debe usar catchAsync (spec 03-controllers)
- Los errores se lanzan como CustomError (spec 06-utils)
- Todo recurso esta scopeado por businessUuid excepto auth y businesses en si
- Soft delete por defecto, hard delete via endpoint separado
