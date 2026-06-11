const { env } = require('../config/env');

// Adaptadores
const { BcryptPasswordHasher } = require('../modules/auth/infrastructure/services/bcrypt-password-hasher');
const { JwtTokenSigner } = require('../modules/auth/infrastructure/services/jwt-token-signer');
const { MongoUserRepository } = require('../modules/users/infrastructure/persistence/mongo-user.repository');
const { MongoCaseRepository } = require('../modules/cases/infrastructure/persistence/mongo-case.repository');
const { MongoRequestRepository } = require('../modules/requests/infrastructure/persistence/mongo-request.repository');
const { MongoDocumentRepository } = require('../modules/documents/infrastructure/persistence/mongo-document.repository');
const { MongoEventRepository } = require('../modules/events/infrastructure/persistence/mongo-event.repository');
const { MongoTaskRepository } = require('../modules/tasks/infrastructure/persistence/mongo-task.repository');
const { MongoMessageRepository } = require('../modules/messages/infrastructure/persistence/mongo-message.repository');
const { MongoNotificationRepository } = require('../modules/notifications/infrastructure/persistence/mongo-notification.repository');
const { MongoActivityRepository } = require('../modules/activities/infrastructure/persistence/mongo-activity.repository');

// Casos de uso
const { LoginUseCase } = require('../modules/auth/application/use-cases/login.use-case');
const { CreateUserUseCase } = require('../modules/users/application/use-cases/create-user.use-case');
const { ListUsersUseCase } = require('../modules/users/application/use-cases/list-users.use-case');
const { FindUserUseCase } = require('../modules/users/application/use-cases/find-user.use-case');
const { UpdateUserUseCase } = require('../modules/users/application/use-cases/update-user.use-case');
const { CreateCaseUseCase } = require('../modules/cases/application/use-cases/create-case.use-case');
const { ListCasesUseCase } = require('../modules/cases/application/use-cases/list-cases.use-case');
const { FindCaseUseCase } = require('../modules/cases/application/use-cases/find-case.use-case');
const { UpdateCaseStatusUseCase } = require('../modules/cases/application/use-cases/update-case-status.use-case');
const { CreateRequestUseCase } = require('../modules/requests/application/use-cases/create-request.use-case');
const { ListRequestsUseCase } = require('../modules/requests/application/use-cases/list-requests.use-case');
const { ResolveRequestUseCase } = require('../modules/requests/application/use-cases/resolve-request.use-case');
const { ListDocumentsUseCase } = require('../modules/documents/application/use-cases/list-documents.use-case');
const { CreateDocumentUseCase } = require('../modules/documents/application/use-cases/create-document.use-case');
const { DeleteDocumentUseCase } = require('../modules/documents/application/use-cases/delete-document.use-case');
const { ListEventsUseCase } = require('../modules/events/application/use-cases/list-events.use-case');
const { CreateEventUseCase } = require('../modules/events/application/use-cases/create-event.use-case');
const { DeleteEventUseCase } = require('../modules/events/application/use-cases/delete-event.use-case');
const { ListTasksUseCase } = require('../modules/tasks/application/use-cases/list-tasks.use-case');
const { CreateTaskUseCase } = require('../modules/tasks/application/use-cases/create-task.use-case');
const { ToggleTaskUseCase } = require('../modules/tasks/application/use-cases/toggle-task.use-case');
const { SendMessageUseCase } = require('../modules/messages/application/use-cases/send-message.use-case');
const { ListMessagesUseCase } = require('../modules/messages/application/use-cases/list-messages.use-case');
const { ListNotificationsUseCase } = require('../modules/notifications/application/use-cases/list-notifications.use-case');
const { MarkAllReadUseCase } = require('../modules/notifications/application/use-cases/mark-all-read.use-case');
const { ListRecentActivitiesUseCase } = require('../modules/activities/application/use-cases/list-recent-activities.use-case');
const { ListCaseActivitiesUseCase } = require('../modules/activities/application/use-cases/list-case-activities.use-case');
const { DashboardReportUseCase } = require('../modules/reports/application/use-cases/dashboard-report.use-case');

/**
 * COMPOSITION ROOT — Inyección de dependencias manual y explícita.
 *
 * Es el ÚNICO lugar del sistema donde se conectan puertos con adaptadores.
 * Ventaja sobre un contenedor mágico: el grafo de dependencias es visible
 * y navegable — cada caso de uso recibe exactamente lo que necesita.
 *
 * El RealtimePublisher se recibe como parámetro porque su adaptador (Socket.IO)
 * necesita el servidor HTTP, que se crea en el bootstrap.
 *
 * @param {import('./ports/realtime-publisher.port').RealtimePublisher} realtime
 */
function buildContainer(realtime) {
  // ── Servicios compartidos ──
  const tokens = new JwtTokenSigner(env.jwtSecret, env.jwtExpiresIn);
  const hasher = new BcryptPasswordHasher();

  // ── Repositorios (adaptadores Mongo) ──
  const userRepo = new MongoUserRepository();
  const caseRepo = new MongoCaseRepository();
  const requestRepo = new MongoRequestRepository();
  const documentRepo = new MongoDocumentRepository();
  const eventRepo = new MongoEventRepository();
  const taskRepo = new MongoTaskRepository();
  const messageRepo = new MongoMessageRepository();
  const notificationRepo = new MongoNotificationRepository();
  const activityRepo = new MongoActivityRepository();

  // ── Casos de uso ──
  const createCase = new CreateCaseUseCase(caseRepo, realtime);

  return {
    tokens,
    auth: {
      login: new LoginUseCase(userRepo, hasher, tokens),
    },
    users: {
      createUser: new CreateUserUseCase(userRepo, hasher),
      listUsers: new ListUsersUseCase(userRepo),
      findUser: new FindUserUseCase(userRepo),
      updateUser: new UpdateUserUseCase(userRepo),
    },
    cases: {
      createCase,
      listCases: new ListCasesUseCase(caseRepo),
      findCase: new FindCaseUseCase(caseRepo),
      updateStatus: new UpdateCaseStatusUseCase(caseRepo, realtime),
    },
    requests: {
      createRequest: new CreateRequestUseCase(requestRepo, realtime),
      listRequests: new ListRequestsUseCase(requestRepo),
      // Composición de casos de uso: aprobar solicitud → crear expediente
      resolveRequest: new ResolveRequestUseCase(requestRepo, createCase, realtime),
    },
    documents: {
      listDocs: new ListDocumentsUseCase(documentRepo),
      createDoc: new CreateDocumentUseCase(documentRepo, realtime),
      deleteDoc: new DeleteDocumentUseCase(documentRepo),
    },
    events: {
      listEvents: new ListEventsUseCase(eventRepo),
      createEvent: new CreateEventUseCase(eventRepo, realtime),
      deleteEvent: new DeleteEventUseCase(eventRepo),
    },
    tasks: {
      listTasks: new ListTasksUseCase(taskRepo),
      createTask: new CreateTaskUseCase(taskRepo, realtime),
      toggleTask: new ToggleTaskUseCase(taskRepo, realtime),
    },
    messages: {
      sendMsg: new SendMessageUseCase(messageRepo, realtime),
      listMsgs: new ListMessagesUseCase(messageRepo),
    },
    notifications: {
      listNotifs: new ListNotificationsUseCase(notificationRepo),
      markAllRead: new MarkAllReadUseCase(notificationRepo),
    },
    activities: {
      listRecent: new ListRecentActivitiesUseCase(activityRepo),
      listByCase: new ListCaseActivitiesUseCase(activityRepo),
    },
    reports: {
      dashboard: new DashboardReportUseCase(caseRepo, requestRepo, userRepo, realtime),
    },
  };
}

module.exports = { buildContainer };
