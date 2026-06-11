# Bitácora de decisiones técnicas — LegalCase Backend (Express / MEAN)

Registro razonado de las decisiones de arquitectura tomadas al reconstruir el
backend desde cero con stack MEAN puro (MongoDB Atlas · Express · Angular · Node),
eliminando por completo NestJS.

---

## D-01 · Express + JavaScript puro (Node.js) en lugar de NestJS

**Decisión:** reconstruir sobre Express 4 con JavaScript puro (CommonJS),
sin TypeScript ni transpiladores: el código corre directo sobre Node.js.
**Razón:** el requisito del proyecto exige stack MEAN sin framework opinado
y ejecución nativa en Node. Express no impone estructura, lo cual nos obliga
(y nos permite) a demostrar la arquitectura hexagonal de forma explícita, sin
esconderla detrás de decoradores. Todo lo que NestJS hacía "por magia" ahora
es código visible y defendible: validación, autenticación, RBAC e inyección
de dependencias. Los contratos entre capas se documentan con JSDoc.

## D-02 · Arquitectura hexagonal estricta por módulo

**Decisión:** cada módulo tiene `domain/` (entidades + puertos), `application/`
(DTOs + casos de uso) e `infrastructure/` (rutas HTTP + persistencia Mongo).
**Regla de dependencia:** infrastructure → application → domain, nunca al revés.
**Razón:** el dominio (`User`, `LegalCase`, `LegalRequest`…) son clases JavaScript
puras sin imports de Express, Mongoose ni Socket.IO. Se puede cambiar la base de
datos o el framework HTTP sin tocar una línea de negocio. Los puertos se
documentan con `@typedef` de JSDoc: cualquier objeto que implemente esos
métodos satisface el contrato (duck typing).

## D-03 · Composition Root manual (`src/shared/container.js`)

**Decisión:** inyección de dependencias manual en un único archivo, sin
contenedor DI (ni el de Nest ni librerías como tsyringe/inversify).
**Razón:** (a) cumple "eliminar la DI de NestJS" al pie de la letra;
(b) el grafo de dependencias completo es visible en una sola pantalla;
(c) cada caso de uso recibe explícitamente sus puertos en el constructor.
Es la forma más didáctica de demostrar el patrón puertos-y-adaptadores
en la defensa.

## D-04 · Puertos transversales: `RealtimePublisher` y `TokenSigner`

**Decisión:** los casos de uso publican eventos con `realtime.publish(topic, payload)`
y firman tokens con `tokens.sign(payload)` — ambas interfaces en `src/shared/ports/`.
**Razón:** mejora respecto a la versión NestJS: la capa de aplicación **ni siquiera
conoce las palabras "socket" o "jwt"**. Socket.IO vive solo en
`realtime/socketio-realtime.adapter.js` y jsonwebtoken solo en
`jwt-token-signer.js`. En tests se sustituyen por mocks triviales.

## D-05 · Errores tipados + middleware traductor

**Decisión:** jerarquía `AppError` (`BadRequest`, `Unauthorized`, `Forbidden`,
`NotFound`, `Conflict`) lanzada desde los casos de uso; el middleware
`errorHandler` los traduce a HTTP en un único lugar.
**Razón:** los casos de uso expresan fallos de negocio sin conocer códigos HTTP
ni el objeto `res`. Sustituye a las excepciones de NestJS sin acoplar la
aplicación a Express. `asyncHandler` propaga rechazos de promesas al handler.

## D-06 · Validación con esquemas JS puros vía middleware `validateDto`

**Decisión:** sustituir class-validator/class-transformer (que dependen de
decoradores de TypeScript) por una mini-librería propia en JavaScript puro
(`src/shared/validation/validator.js`). Cada DTO declara un esquema plano
(`{ campo: { type, enum, minLength, … } }`) y el middleware `validateDto`
lo valida con whitelist, campos extra prohibidos en body y coerción de
tipos en query.
**Razón:** sustituye al ValidationPipe de Nest sin decoradores ni
`reflect-metadata`; los DTOs validan exactamente las mismas reglas que antes
y los campos no declarados se rechazan (defensa contra mass assignment).
La librería tiene su propia suite de tests.

## D-07 · Autenticación y RBAC como middlewares componibles

**Decisión:** `requireAuth(tokens)` valida el Bearer JWT y puebla `req.user`;
`requireRoles('administrador', 'abogado')` aplica el control por rol.
**Razón:** sustituyen a los Guards de Nest. Al ser funciones que reciben el
puerto `TokenSigner`, son testeables y la matriz de permisos queda legible
en las propias rutas: `router.post('/', requireRoles('administrador'), …)`.

## D-08 · Controladores delgados: rutas como funciones fábrica

**Decisión:** cada módulo expone `xxxRoutes(deps): Router` que recibe sus casos
de uso. El handler hace exactamente tres cosas: validar entrada (middleware),
invocar `useCase.execute()`, serializar la respuesta.
**Razón:** cero lógica de negocio en HTTP (criterio explícito de la rúbrica) y
las rutas se montan con dependencias ya resueltas desde el composition root.

## D-09 · Repositorios desacoplados con mappers

**Decisión:** puertos (`UserRepository`, `CaseRepository`…) en domain; adaptadores
`Mongo*Repository` + schemas + mappers en infrastructure. Colecciones en español
(`usuarios`, `expedientes`, `solicitudes`…), `contrasena` con `select: false`.
**Razón:** los documentos Mongoose nunca salen de la capa de persistencia; los
casos de uso trabajan solo con entidades de dominio. Cambiar Mongo por Postgres
sería escribir nuevos adaptadores sin tocar aplicación ni dominio.

## D-10 · Composición de casos de uso: aprobar solicitud → crear expediente

**Decisión:** `ResolveRequestUseCase` recibe `CreateCaseUseCase` como dependencia
y lo invoca al aprobar (vencimiento +90 días, enlaza `expedienteId`).
**Razón:** la regla "una solicitud aprobada genera expediente" vive en un solo
lugar; la generación del código `EXP-####` y el evento `case.created` no se
duplican. Es el flujo crítico del negocio y por eso tiene su propia suite de tests.

## D-11 · Tiempo real sobre el mismo servidor HTTP

**Decisión:** Socket.IO montado sobre el `http.Server` que comparte con Express
(`server.on('request', app)`), path `/realtime`, 10 eventos de dominio.
**Razón:** un solo puerto (3000) para REST y WebSocket simplifica CORS, el deploy
y la conexión del frontend. Eventos: `case.created`, `case.status.changed`,
`request.created`, `request.resolved`, `document.created`, `event.created`,
`task.created`, `task.toggled`, `message.sent`, `reports.updated`.

## D-12 · Testing de la capa de aplicación con puertos mockeados

**Decisión:** Jest sin transpiladores; 14 tests en 3 suites sobre los módulos
críticos: `LoginUseCase` (4 escenarios), `ResolveRequestUseCase` (4 escenarios)
y la librería de validación de DTOs (6 escenarios).
**Razón:** gracias a la hexagonal, los tests no necesitan Mongo, bcrypt ni
Express: los puertos se mockean con `jest.fn()`. Son rápidos (<6 s) y prueban
reglas de negocio reales (credenciales inválidas, usuario inactivo, solicitud
ya resuelta, creación automática de expediente).

## D-13 · CI/CD con GitHub Actions

**Decisión:** workflow con job `build-and-test` (Node 20: `npm ci` → `npm test`
→ `npm run build` → artifact) y job `deploy` solo en `main` (webhook de Render
vía secret; alternativa Railway comentada). En JavaScript puro el "build" es
una verificación de sintaxis (`node --check` sobre todos los .js).
**Razón:** cumple build automático + ejecución de pruebas; el deploy es opcional
y no rompe el pipeline si el secret no existe.

## D-14 · Migración completa de TypeScript a JavaScript puro

**Decisión:** convertir los 109 archivos .ts a JavaScript (CommonJS) manteniendo
la misma estructura hexagonal archivo por archivo: entidades y casos de uso como
clases JS, puertos como `@typedef` JSDoc, DTOs como esquemas planos.
**Razón:** requisito de ejecutar directo sobre Node.js sin compilación.
Se eliminaron typescript, ts-node, ts-jest, class-validator, class-transformer
y reflect-metadata; quedaron solo las 7 dependencias de runtime + Jest.

---

## Cumplimiento de la rúbrica

| # | Criterio | Dónde se cumple |
|---|----------|-----------------|
| 1 | Arquitectura hexagonal (3 pts) | domain/application/infrastructure por módulo + composition root (D-02, D-03) |
| 2 | Funcionalidades por rol (7 pts) | RBAC con `requireRoles` en 11 módulos; matriz en README §8 (D-07) |
| 3 | MongoDB con repositorios desacoplados (5 pts) | Puertos + `Mongo*Repository` + mappers; Atlas vía `MONGODB_URI` (D-09) |
| 4 | Tiempo real (3 pts) | Socket.IO, 10 eventos de dominio, puerto `RealtimePublisher` (D-04, D-11) |
| 5 | Frontend Angular (7 pts) | Frontend ya entregado; endpoints/contratos idénticos (README §9) |
| 6 | Backend con casos de uso (3 pts) | 24 casos de uso, un archivo por caso, `execute()` (D-08, D-10) |
| 7 | Testing (1 pt) | Jest, 14 tests verdes en módulos críticos (D-12) |
| 8 | CI/CD GitHub Actions (1 pt) | `.github/workflows/ci.yml` (D-13) |
