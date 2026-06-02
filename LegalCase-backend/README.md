# LEXVANTE — Backend (NestJS · Hexagonal · MongoDB)

API REST + WebSockets del Sistema Web de Gestión de Casos Legales LEXVANTE.
Construido con **NestJS 10**, **MongoDB/Mongoose**, **JWT**, **Socket.IO**
y **arquitectura hexagonal** estricta.

---

## 1. Requisitos

- **Node.js 20+** y **npm 9+**
- **MongoDB 6+** corriendo en `localhost:27017` (o ajustar `MONGODB_URI` en `.env`)
- Variables de entorno en `.env` (ver `.env.example`)

## 2. Instalación

```bash
npm install
cp .env.example .env       # ajustar MONGODB_URI y JWT_SECRET
npm run seed               # carga datos demo y crea los usuarios de prueba
npm run start:dev          # API en http://localhost:3000/api
```

### Credenciales demo (creadas por el seed)

| Rol           | Correo                  | Contraseña |
|---------------|-------------------------|------------|
| Administrador | admin@lexvante.hn       | demo1234   |
| Abogado       | abogado@lexvante.hn     | demo1234   |
| Cliente       | cliente@lexvante.hn     | demo1234   |

## 3. Scripts disponibles

| Script              | Acción                                          |
|---------------------|-------------------------------------------------|
| `npm run start:dev` | Modo desarrollo con hot-reload                  |
| `npm run build`     | Compila TypeScript a `dist/`                    |
| `npm run start:prod`| Ejecuta el bundle compilado                     |
| `npm run seed`      | Pobla la BD con datos demo                      |
| `npm test`          | Ejecuta pruebas unitarias (Jest)                |
| `npm run test:cov`  | Tests con reporte de cobertura                  |
| `npm run lint`      | ESLint                                          |

---

## 4. Arquitectura hexagonal

Cada módulo está organizado en tres capas, con dependencias **siempre hacia adentro**
(infrastructure → application → domain). El dominio no conoce Mongo, Nest, ni HTTP.

```
src/modules/<modulo>/
├── domain/                       ← núcleo puro, sin frameworks
│   ├── entities/                 → clases de negocio
│   └── ports/                    → contratos abstractos (Repository, Hasher…)
├── application/                  ← orquestación, sin detalles externos
│   ├── dto/                      → entradas/salidas validadas (class-validator)
│   └── use-cases/                → un archivo por caso de uso
└── infrastructure/               ← adaptadores
    ├── controllers/              → HTTP (Nest controllers)
    └── persistence/              → Mongoose schemas + repository.impl
```

**Inyección de dependencias:** las clases abstractas de los puertos funcionan
simultáneamente como **interfaz + token**. Cada módulo registra:

```ts
providers: [{ provide: UserRepository, useClass: MongoUserRepository }]
```

Los casos de uso reciben la abstracción, no la implementación:

```ts
constructor(@Inject(UserRepository) private readonly users: UserRepository) {}
```

Beneficio: el dominio queda libre de Mongoose y los casos de uso son
**testeables sin levantar Mongo ni HTTP** (ver `test/login.use-case.spec.ts`).

---

## 5. Estructura del proyecto

```
src/
├── main.ts                       # bootstrap (ValidationPipe, filtros, CORS, /api)
├── app.module.ts                 # composición raíz
├── config/configuration.ts       # env → typed config
├── shared/
│   ├── filters/                  # AllExceptionsFilter
│   ├── decorators/               # @CurrentUser, @Roles
│   ├── guards/                   # RolesGuard (RBAC)
│   └── pipes/                    # ObjectIdPipe
├── realtime/                     # WebSocket Gateway (Socket.IO) — global
│   ├── realtime.gateway.ts
│   └── realtime.service.ts       # publish() inyectado por los use cases
└── modules/
    ├── auth/                     # Login + JWT + Passport (hexagonal completo)
    ├── users/                    # CRUD usuarios + roles
    ├── requests/                 # Solicitudes legales → aprobar → expediente
    ├── cases/                    # Expedientes (entidad central)
    ├── documents/                # Documentos por expediente
    ├── events/                   # Calendario (audiencias, reuniones)
    ├── tasks/                    # Tareas asignadas a abogados
    ├── messages/                 # Chat cliente ↔ abogado
    ├── notifications/            # Notificaciones por usuario
    ├── activities/               # Bitácora de actividad por expediente
    └── reports/                  # KPIs agregados (cross-repository)
```

---

## 6. Endpoints principales

Prefijo global **`/api`**. Todas las rutas privadas requieren `Authorization: Bearer <jwt>`.

### Auth (público)
- `POST /api/auth/login` — `{ correo, contrasena }` → `{ token, user }`
- `GET  /api/auth/me` — devuelve el payload del JWT actual

### Solicitudes (Cliente / Administrador)
- `POST  /api/requests` — **público**, cliente envía consulta legal
- `GET   /api/requests?estado=Pendiente` — solo administrador
- `PATCH /api/requests/:id/resolve` — administrador: `{ estado, motivo? }`
  - Si `estado === 'Aprobada'`, **crea el expediente automáticamente**

### Expedientes (RBAC por endpoint)
- `GET   /api/cases` — todos los roles (con filtros: `estado`, `prioridad`, `q`, …)
- `GET   /api/cases/:id`
- `POST  /api/cases` — solo administrador
- `PATCH /api/cases/:id/status` — administrador/abogado

### Otros módulos
- `GET/POST/DELETE /api/documents`
- `GET/POST/DELETE /api/events`
- `GET/POST/PATCH  /api/tasks` (incluye `PATCH /tasks/:id/toggle`)
- `GET/POST        /api/messages`
- `GET/PATCH       /api/notifications` (`read-all`)
- `GET             /api/activities` y `/api/activities/case/:id`
- `GET             /api/reports/dashboard` — solo administrador

---

## 7. Tiempo real (Socket.IO)

WebSocket en `ws://localhost:3000/realtime`. El backend emite eventos al modificar
el dominio y el frontend Angular se suscribe para refrescar el tablero, los reportes
y los listados sin recargar.

| Evento                | Cuándo se emite                                     |
|-----------------------|-----------------------------------------------------|
| `case.created`        | Se crea un expediente                               |
| `case.status.changed` | Cambia el estado de un expediente (tablero Kanban)  |
| `request.created`     | Cliente envía una solicitud                         |
| `request.resolved`    | Admin aprueba / rechaza solicitud                   |
| `document.created`    | Se sube un documento                                |
| `event.created`       | Nueva audiencia / reunión en el calendario          |
| `task.created` / `task.toggled` | Tareas creadas o marcadas como completadas |
| `message.sent`        | Mensaje enviado en el chat                          |
| `reports.updated`     | Recalculo del dashboard de KPIs                     |

El `RealtimeService` es inyectado por los **casos de uso**, no por los controladores,
para que la capa de aplicación no dependa del transporte WebSocket directamente.

---

## 8. RBAC (control por rol)

| Acción                                | Administrador | Abogado | Cliente |
|---------------------------------------|:-:|:-:|:-:|
| Crear usuarios                        | ✅ |   |   |
| Crear expediente                      | ✅ |   |   |
| Resolver solicitud                    | ✅ |   |   |
| Cambiar estado de expediente          | ✅ | ✅ |   |
| Crear/listar tareas                   | ✅ | ✅ |   |
| Subir documentos                      | ✅ | ✅ |   |
| Ver expedientes / mensajes            | ✅ | ✅ | ✅ |
| Enviar mensajes                       | ✅ | ✅ | ✅ |
| Enviar solicitud legal (público)      |   |   | ✅ |
| Dashboard de reportes                 | ✅ |   |   |

Implementado con `@Roles(...)` + `RolesGuard` global que lee el rol del JWT.

---

## 9. Conexión con el frontend Angular

1. El frontend (proyecto separado, ya entregado) usa `environment.apiUrl`.
   Cambiar a `http://localhost:3000/api`.
2. En `AuthService.login()` descomentar la llamada real `this.api.post('auth/login', creds)`.
3. El `jwtInterceptor` ya adjunta `Authorization: Bearer <token>`.
4. El `errorInterceptor` cierra sesión ante 401.

No se requiere tocar guards, store, layouts ni componentes del frontend.

---

## 10. CI/CD

`.github/workflows/ci.yml` ejecuta en cada push/PR:

1. `npm ci` — instalación reproducible
2. `npm test` — pruebas unitarias
3. `npm run build` — compilación TypeScript
4. **Upload artifact** del bundle compilado
5. **Deploy** (solo `main`): trigger del webhook de Render con el secret
   `RENDER_DEPLOY_HOOK_URL` (alternativa Railway comentada en el workflow).
