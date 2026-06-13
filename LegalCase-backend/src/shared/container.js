const { env } = require('../config/env');

// Adaptadores
const { BcryptPasswordHasher } = require('../modules/auth/infrastructure/services/bcrypt-password-hasher');
const { JwtTokenSigner } = require('../modules/auth/infrastructure/services/jwt-token-signer');
const { MongoUserRepository } = require('../modules/users/infrastructure/persistence/mongo-user.repository');
const { MongoCaseRepository } = require('../modules/cases/infrastructure/persistence/mongo-case.repository');
const { MongoRequestRepository } = require('../modules/requests/infrastructure/persistence/mongo-request.repository');
const { MongoDocumentRepository } = require('../modules/documents/infrastructure/persistence/mongo-document.repository');
const { MongoEventRepository } = require('../modules/events/infrastructure/persistence/mongo-event.repository');
const { MongoMessageRepository } = require('../modules/messages/infrastructure/persistence/mongo-message.repository');
const { MongoNotificationRepository } = require('../modules/notifications/infrastructure/persistence/mongo-notification.repository');
const { MongoActivityRepository } = require('../modules/activities/infrastructure/persistence/mongo-activity.repository');
const { MongoAuditRepository } = require('../modules/audit/infrastructure/persistence/mongo-audit.repository');
const { MongoTaskRepository } = require('../modules/tasks/infrastructure/persistence/mongo-task.repository');
const { NodemailerEmailSender } = require('../email/nodemailer-email-sender.adapter');

// Casos de uso
const { LoginUseCase } = require('../modules/auth/application/use-cases/login.use-case');
const { CreateUserUseCase } = require('../modules/users/application/use-cases/create-user.use-case');
const { OnboardUserUseCase } = require('../modules/users/application/use-cases/onboard-user.use-case');
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
const { SendMessageUseCase } = require('../modules/messages/application/use-cases/send-message.use-case');
const { ListMessagesUseCase } = require('../modules/messages/application/use-cases/list-messages.use-case');
const { ListNotificationsUseCase } = require('../modules/notifications/application/use-cases/list-notifications.use-case');
const { MarkAllReadUseCase } = require('../modules/notifications/application/use-cases/mark-all-read.use-case');
const { ListRecentActivitiesUseCase } = require('../modules/activities/application/use-cases/list-recent-activities.use-case');
const { ListCaseActivitiesUseCase } = require('../modules/activities/application/use-cases/list-case-activities.use-case');
const { CreateActivityUseCase } = require('../modules/activities/application/use-cases/create-activity.use-case');
const { RecordAuditUseCase } = require('../modules/audit/application/use-cases/record-audit.use-case');
const { ListAuditUseCase } = require('../modules/audit/application/use-cases/list-audit.use-case');
const { ListTasksUseCase } = require('../modules/tasks/application/use-cases/list-tasks.use-case');
const { CreateTaskUseCase } = require('../modules/tasks/application/use-cases/create-task.use-case');
const { UpdateTaskUseCase } = require('../modules/tasks/application/use-cases/update-task.use-case');
const { DeleteTaskUseCase } = require('../modules/tasks/application/use-cases/delete-task.use-case');
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
  const email = new NodemailerEmailSender(env.smtp);

  // ── Repositorios (adaptadores Mongo) ──
  const userRepo = new MongoUserRepository();
  const caseRepo = new MongoCaseRepository();
  const requestRepo = new MongoRequestRepository();
  const documentRepo = new MongoDocumentRepository();
  const eventRepo = new MongoEventRepository();
  const messageRepo = new MongoMessageRepository();
  const notificationRepo = new MongoNotificationRepository();
  const activityRepo = new MongoActivityRepository();
  const auditRepo = new MongoAuditRepository();
  const taskRepo = new MongoTaskRepository();

  // ── Casos de uso reutilizados por la composición de aprobación ──
  const createCase = new CreateCaseUseCase(caseRepo, realtime);
  const createUser = new CreateUserUseCase(userRepo, hasher);
  const createActivity = new CreateActivityUseCase(activityRepo, realtime);
  const recordAudit = new RecordAuditUseCase(auditRepo);
  const onboardUser = new OnboardUserUseCase(createUser, notificationRepo, recordAudit, email, env.frontendUrl);

  return {
    tokens,
    auth: {
      login: new LoginUseCase(userRepo, hasher, tokens),
    },
    users: {
      createUser,
      onboardUser,
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
      // Composición de casos de uso: aprobar solicitud → cliente + expediente +
      // actividad + notificación + correo + auditoría.
      resolveRequest: new ResolveRequestUseCase(
        requestRepo, createCase, userRepo, createUser, createActivity,
        notificationRepo, recordAudit, email, realtime, env.frontendUrl, hasher,
      ),
    },
    documents: {
      listDocs: new ListDocumentsUseCase(documentRepo, caseRepo),
      createDoc: new CreateDocumentUseCase(documentRepo, realtime),
      deleteDoc: new DeleteDocumentUseCase(documentRepo),
    },
    events: {
      listEvents: new ListEventsUseCase(eventRepo),
      createEvent: new CreateEventUseCase(eventRepo, realtime),
      deleteEvent: new DeleteEventUseCase(eventRepo),
    },
    messages: {
      sendMsg: new SendMessageUseCase(messageRepo, realtime, caseRepo),
      listMsgs: new ListMessagesUseCase(messageRepo, caseRepo),
    },
    notifications: {
      listNotifs: new ListNotificationsUseCase(notificationRepo),
      markAllRead: new MarkAllReadUseCase(notificationRepo),
    },
    activities: {
      listRecent: new ListRecentActivitiesUseCase(activityRepo),
      listByCase: new ListCaseActivitiesUseCase(activityRepo, caseRepo),
      createActivity,
    },
    audit: {
      listAudit: new ListAuditUseCase(auditRepo),
    },
    tasks: {
      listTasks: new ListTasksUseCase(taskRepo, caseRepo),
      createTask: new CreateTaskUseCase(taskRepo, caseRepo, notificationRepo, realtime),
      updateTask: new UpdateTaskUseCase(taskRepo, realtime),
      deleteTask: new DeleteTaskUseCase(taskRepo, realtime),
    },
  };
}

module.exports = { buildContainer };
