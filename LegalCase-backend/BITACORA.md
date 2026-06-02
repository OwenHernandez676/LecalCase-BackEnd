# Bitácora Técnica — Backend LEXVANTE (NestJS · Hexagonal)

Registro de las decisiones de arquitectura tomadas al construir el backend de LEXVANTE.

---

### D-01 · Arquitectura hexagonal (Ports & Adapters) por módulo
Cada módulo de negocio se separa en tres capas con dependencias siempre hacia
adentro (`infrastructure → application → domain`). El dominio es código TypeScript
puro: sin Mongoose, sin Nest, sin HTTP. **Beneficio:** las reglas de negocio son
estables aunque cambie la base de datos o el framework, y los casos de uso son
testeables sin levantar Mongo ni HTTP.

### D-02 · Puertos abstractos como interfaz + token de DI
Cada puerto (`UserRepository`, `CaseRepository`, `PasswordHasher`, …) se declara
como `abstract class`. Sirve simultáneamente como **contrato** (TypeScript) y como
**token de DI** (Nest). Cada módulo registra `{ provide: UserRepository, useClass: MongoUserRepository }`.
**Razón:** los casos de uso reciben la abstracción, no la implementación —
sustituir Mongo por otra base requiere sólo un nuevo adaptador, sin tocar dominio
ni aplicación.

### D-03 · Casos de uso "uno por archivo"
Cada caso de uso es una clase con un único método `execute()` (Single
Responsibility). Ejemplos: `LoginUseCase`, `CreateCaseUseCase`,
`ResolveRequestUseCase`. Los controladores **sólo delegan**.
**Beneficio:** los criterios 2 (Funcionalidades por Rol) y 6 (Casos de uso) de la
rúbrica se satisfacen de forma natural — la lógica de negocio nunca vive en
controladores ni en repositorios.

### D-04 · DTOs con `class-validator` y `ValidationPipe` global
Cada caso de uso recibe un DTO declarativo con decoradores (`@IsEmail`, `@IsIn`,
`@MinLength`, …). El `ValidationPipe` global de Nest valida automáticamente con
`whitelist: true` y `forbidNonWhitelisted: true`.
**Beneficio:** validaciones declarativas, mensajes consistentes y blindaje contra
campos no esperados.

### D-05 · MongoDB con Mongoose, mappers explícitos
La capa de persistencia usa `@nestjs/mongoose`. Cada esquema vive en
`infrastructure/persistence/<entity>.schema.ts` y existe un **mapper explícito**
(`<entity>.mapper.ts`) que traduce `Document` ↔ entidad de dominio.
**Razón:** el dominio nunca conoce a Mongoose; el cruce de capa es siempre
explícito y auditable. Los índices viven con los schemas.

### D-06 · Tiempo real desacoplado vía `RealtimeService`
El gateway de WebSockets (`RealtimeGateway`) es infraestructura. Los casos de uso
inyectan un `RealtimeService` que ENCAPSULA el gateway. Cuando un caso de uso
crea un expediente, llama `this.realtime.publish('case.created', case)` — sin
saber nada de Socket.IO.
**Beneficio:** la capa de aplicación queda libre del detalle de transporte; si
mañana se cambia Socket.IO por Server-Sent Events, sólo se reemplaza el adaptador.

### D-07 · Flujo "Solicitud aprobada → Expediente creado"
`ResolveRequestUseCase` orquesta dos casos de uso: actualiza la solicitud y, si
estado = `Aprobada`, invoca `CreateCaseUseCase.execute(...)`. Es composición de
casos de uso, no llamadas directas al repositorio de expedientes — preserva la
lógica de creación (generación de código `EXP-####`, emisión de evento en vivo).
**Razón:** los flujos de negocio quedan documentados como composición de casos
de uso, fácil de leer y modificar.

### D-08 · JWT con Passport, `PasswordHasher` como puerto
`LoginUseCase` no depende de `bcrypt` ni de `@nestjs/jwt` por su naturaleza: depende
del puerto `PasswordHasher` (abstracto) y de `JwtService`. El adaptador
`BcryptPasswordHasher` implementa el puerto.
**Beneficio:** el test unitario (`test/login.use-case.spec.ts`) mockea el puerto y
verifica las cuatro rutas críticas (credenciales correctas, usuario inexistente,
contraseña incorrecta, usuario inactivo) sin tocar Mongo ni bcrypt real.

### D-09 · RBAC con `@Roles(...)` + `RolesGuard`
El control de acceso por rol se aplica con un decorador `@Roles('administrador', 'abogado')`
sobre cada endpoint, leído por `RolesGuard` desde el reflector. El rol viaja en el
JWT y `JwtStrategy.validate()` lo coloca en `req.user`.
**Razón:** matriz de permisos clara y centralizada en los controladores, sin
duplicar lógica de autorización.

### D-10 · Endpoint público para Solicitudes
`POST /requests` es el único endpoint sin `JwtAuthGuard`: los clientes pueden
enviar su consulta legal sin estar registrados. Tras la aprobación del admin, se
crea automáticamente la cuenta del cliente y el expediente.
**Razón:** modelo de captación de leads para un despacho jurídico real.

### D-11 · CI/CD con GitHub Actions: build, test y deploy
El workflow `ci.yml` ejecuta `npm ci`, `npm test` y `npm run build` en cada PR.
En `main` agrega un job de **deploy** que descarga el artifact y dispara un
webhook de Render (alternativa Railway comentada). Cubre el criterio 8 de la
rúbrica.

### D-12 · `bcryptjs` en vez de `bcrypt` nativo
Se eligió `bcryptjs` (puro JS) por encima de `bcrypt` (binding nativo) para
evitar fallos de build en CI y ambientes serverless donde no hay toolchain de C++.
El puerto `PasswordHasher` permite cambiar el adaptador sin tocar dominio.

---

## Resumen del cumplimiento de la rúbrica

| Criterio                                | Cómo se cumple                                                                                          |
|-----------------------------------------|---------------------------------------------------------------------------------------------------------|
| **1. Arquitectura hexagonal (3 pts)**   | Tres capas por módulo, dominio puro, puertos abstractos, adaptadores Mongo (D-01, D-02, D-05)           |
| **2. Funcionalidades por rol (7 pts)**  | RBAC con `@Roles` + `RolesGuard`; matriz documentada; flujo público de solicitudes (D-09, D-10)         |
| **3. MongoDB + repos desacoplados (5pts)** | Repos detrás de puertos, mappers explícitos, índices con schemas (D-05)                              |
| **4. Tiempo real (3 pts)**              | Gateway Socket.IO encapsulado en `RealtimeService`, eventos en CRUD, tablero Kanban y reportes (D-06)   |
| **5. Frontend (7 pts)**                 | Angular 19 standalone + Signals + lazy loading (proyecto separado ya entregado)                         |
| **6. Casos de uso (3 pts)**             | Un caso de uso por archivo, controladores sólo delegan (D-03)                                           |
| **7. Testing (1 pt)**                   | `LoginUseCase` con 4 escenarios, mocks de puertos (D-08)                                                |
| **8. CI/CD (1 pt)**                     | GitHub Actions: install, test, build, artifact, deploy a Render (D-11)                                  |
