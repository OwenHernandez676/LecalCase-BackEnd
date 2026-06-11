# LegalCase Backend — Stack MEAN (MongoDB Atlas · Express · Angular · Node)

API REST + WebSockets del Sistema Web de Gestión de Casos Legales.
Construido con **Express + JavaScript puro (Node.js)**, **MongoDB Atlas/Mongoose**,
**JWT**, **Socket.IO** y **arquitectura hexagonal** estricta. **Sin NestJS, sin TypeScript.**

---

## 1. Requisitos

- **Node.js 20+** y **npm 9+**
- **MongoDB Atlas** (recomendado) o MongoDB local
- Variables de entorno en `.env` (ver `.env.example`)

## 2. Configurar MongoDB Atlas

1. Crear cuenta gratuita en https://www.mongodb.com/atlas
2. Crear un cluster M0 (gratis) → **Database Access**: crear usuario y contraseña
3. **Network Access**: permitir su IP (o `0.0.0.0/0` para desarrollo)
4. Copiar el *connection string* y pegarlo en `.env`:

```
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/legalcase?retryWrites=true&w=majority
```

## 3. Instalación y ejecución

```bash
npm install
cp .env.example .env       # pegar el connection string de Atlas y un JWT_SECRET
npm run seed               # carga datos demo (usuarios, expedientes, solicitudes)
npm run start:dev          # API en http://localhost:3000/api
```

### Credenciales demo (creadas por el seed)

| Rol           | Correo                   | Contraseña |
|---------------|--------------------------|------------|
| Administrador | admin@legalcase.hn       | demo1234   |
| Abogado       | abogado@legalcase.hn     | demo1234   |
| Cliente       | cliente@legalcase.hn     | demo1234   |

## 4. Scripts

| Script              | Acción                                        |
|---------------------|-----------------------------------------------|
| `npm start`         | Ejecuta la API con Node (`node src/index.js`) |
| `npm run start:dev` | Desarrollo con hot-reload (`node --watch`)    |
| `npm run build`     | Verifica la sintaxis de todos los .js         |
| `npm run seed`      | Pobla la BD con datos demo                    |
| `npm test`          | Pruebas unitarias (Jest)                      |
| `npm run test:cov`  | Tests con cobertura                           |

Sin transpiladores: el código corre directo sobre Node.js.

---

## 5. Arquitectura hexagonal

Cada módulo en tres capas, dependencias **siempre hacia adentro**
(infrastructure → application → domain). El dominio no conoce Mongo, Express ni Socket.IO.

```
src/modules/<modulo>/
├── domain/                  ← núcleo puro, sin frameworks
│   ├── entities/             → clases de negocio (User, LegalCase, …)
│   └── ports/                → contratos documentados con JSDoc: Repository, Hasher…
├── application/             ← orquestación
│   ├── dto/                  → esquemas de entrada validados por el middleware
│   └── use-cases/            → un archivo por caso de uso, método execute()
└── infrastructure/          ← adaptadores
    ├── http/                 → rutas Express (controladores delgados)
    └── persistence/          → schemas Mongoose + mappers + repos Mongo
```

### Composition Root (DI manual)

`src/shared/container.js` es el **único** lugar donde se conectan puertos con
adaptadores. Sin contenedor mágico: el grafo de dependencias es explícito,
visible y navegable.

```js
const userRepo = new MongoUserRepository();
const login = new LoginUseCase(userRepo, hasher, tokens);
```

### Cross-cutting ports (`src/shared/ports`)

- `RealtimePublisher` — los casos de uso publican eventos sin conocer Socket.IO
- `TokenSigner` — la aplicación firma/verifica tokens sin conocer jsonwebtoken

### Validación de DTOs (`src/shared/validation`)

Mini-librería propia en JavaScript puro (reemplaza a class-validator): cada DTO
declara un esquema plano y el middleware `validateDto` lo valida con whitelist,
campos extra prohibidos en body y coerción de tipos en query.

---

## 6. Endpoints

Prefijo global **`/api`**. Rutas privadas requieren `Authorization: Bearer <jwt>`.

### Auth
- `POST /api/auth/login` — `{ correo, contrasena }` → `{ token, user }`
- `GET  /api/auth/me` — payload del JWT actual

### Solicitudes
- `POST  /api/requests` — **público** (cliente envía consulta legal, genera SOL-###)
- `GET   /api/requests?estado=Pendiente` — admin
- `PATCH /api/requests/:id/resolve` — admin; si `Aprobada` → **crea expediente automáticamente**

### Expedientes
- `GET   /api/cases` — todos los roles; filtros `estado, prioridad, abogado, cliente, q`
- `GET   /api/cases/:id`
- `POST  /api/cases` — admin (genera EXP-####)
- `PATCH /api/cases/:id/status` — admin/abogado (tablero Kanban)

### Resto de módulos
- `GET/POST/DELETE /api/documents` · `GET/POST/DELETE /api/events`
- `GET/POST /api/tasks` + `PATCH /api/tasks/:id/toggle`
- `GET /api/messages/:expedienteId` · `POST /api/messages`
- `GET /api/notifications` · `PATCH /api/notifications/read-all`
- `GET /api/activities?limit=10` · `GET /api/activities/case/:id`
- `GET /api/reports/dashboard` — admin (KPIs agregados)
- `GET /api/health` — health check

---

## 7. Tiempo real (Socket.IO)

WebSocket en `ws://localhost:3000` con `path: '/realtime'`.

| Evento                | Cuándo                                            |
|-----------------------|---------------------------------------------------|
| `case.created`        | Se crea un expediente                             |
| `case.status.changed` | Cambia el estado (tablero Kanban en vivo)         |
| `request.created`     | Cliente envía solicitud                           |
| `request.resolved`    | Admin aprueba/rechaza                             |
| `document.created`    | Documento subido                                  |
| `event.created`       | Nueva audiencia/reunión                           |
| `task.created` / `task.toggled` | Tareas                                  |
| `message.sent`        | Chat                                              |
| `reports.updated`     | KPIs del dashboard recalculados                   |

Conexión desde Angular:
```ts
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000', { path: '/realtime' });
socket.on('case.status.changed', (data) => { /* refrescar Kanban */ });
```

---

## 8. RBAC (control por rol)

| Acción                          | Admin | Abogado | Cliente |
|---------------------------------|:-:|:-:|:-:|
| Crear usuarios / expedientes    | ✅ |   |   |
| Resolver solicitudes / reportes | ✅ |   |   |
| Cambiar estado / tareas / docs  | ✅ | ✅ |   |
| Ver expedientes / chat          | ✅ | ✅ | ✅ |
| Enviar solicitud (público)      |   |   | ✅ |

Implementado con `requireAuth(tokens)` + `requireRoles(...)` (middleware Express).

---

## 9. Conexión con el frontend Angular

1. `environment.ts` → `apiUrl: 'http://localhost:3000/api'`
2. En `AuthService.login()` activar la llamada real `this.api.post('auth/login', …)`
3. El `jwtInterceptor` ya adjunta el `Bearer token`; el `errorInterceptor` maneja el 401

Los endpoints, formatos de respuesta, roles y eventos en tiempo real son
idénticos a los que el frontend ya espera.

---

## 10. CI/CD (GitHub Actions)

`.github/workflows/ci.yml`: en cada push/PR ejecuta `npm ci` → `npm test` →
`npm run build` (verificación de sintaxis) → sube el artifact; en `main`
añade deploy vía webhook de Render (secret `RENDER_DEPLOY_HOOK_URL`;
alternativa Railway comentada).
