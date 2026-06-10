import { RealtimePublisher } from './ports/realtime-publisher.port';
import { TokenSigner } from './ports/token-signer.port';
import { env } from '../config/env';

// Adaptadores
import { BcryptPasswordHasher } from '../modules/auth/infrastructure/services/bcrypt-password-hasher';
import { JwtTokenSigner } from '../modules/auth/infrastructure/services/jwt-token-signer';
import { MongoUserRepository } from '../modules/users/infrastructure/persistence/mongo-user.repository';
import { MongoCaseRepository } from '../modules/cases/infrastructure/persistence/mongo-case.repository';
import { MongoRequestRepository } from '../modules/requests/infrastructure/persistence/mongo-request.repository';
import { MongoDocumentRepository } from '../modules/documents/infrastructure/persistence/mongo-document.repository';
import { MongoEventRepository } from '../modules/events/infrastructure/persistence/mongo-event.repository';
import { MongoTaskRepository } from '../modules/tasks/infrastructure/persistence/mongo-task.repository';
import { MongoMessageRepository } from '../modules/messages/infrastructure/persistence/mongo-message.repository';
import { MongoNotificationRepository } from '../modules/notifications/infrastructure/persistence/mongo-notification.repository';
import { MongoActivityRepository } from '../modules/activities/infrastructure/persistence/mongo-activity.repository';

// Casos de uso
import { LoginUseCase } from '../modules/auth/application/use-cases/login.use-case';
import { CreateUserUseCase } from '../modules/users/application/use-cases/create-user.use-case';
import { ListUsersUseCase } from '../modules/users/application/use-cases/list-users.use-case';
import { FindUserUseCase } from '../modules/users/application/use-cases/find-user.use-case';
import { UpdateUserUseCase } from '../modules/users/application/use-cases/update-user.use-case';
import { CreateCaseUseCase } from '../modules/cases/application/use-cases/create-case.use-case';
import { ListCasesUseCase } from '../modules/cases/application/use-cases/list-cases.use-case';
import { FindCaseUseCase } from '../modules/cases/application/use-cases/find-case.use-case';
import { UpdateCaseStatusUseCase } from '../modules/cases/application/use-cases/update-case-status.use-case';
import { CreateRequestUseCase } from '../modules/requests/application/use-cases/create-request.use-case';
import { ListRequestsUseCase } from '../modules/requests/application/use-cases/list-requests.use-case';
import { ResolveRequestUseCase } from '../modules/requests/application/use-cases/resolve-request.use-case';
import { ListDocumentsUseCase } from '../modules/documents/application/use-cases/list-documents.use-case';
import { CreateDocumentUseCase } from '../modules/documents/application/use-cases/create-document.use-case';
import { DeleteDocumentUseCase } from '../modules/documents/application/use-cases/delete-document.use-case';
import { ListEventsUseCase } from '../modules/events/application/use-cases/list-events.use-case';
import { CreateEventUseCase } from '../modules/events/application/use-cases/create-event.use-case';
import { DeleteEventUseCase } from '../modules/events/application/use-cases/delete-event.use-case';
import { ListTasksUseCase } from '../modules/tasks/application/use-cases/list-tasks.use-case';
import { CreateTaskUseCase } from '../modules/tasks/application/use-cases/create-task.use-case';
import { ToggleTaskUseCase } from '../modules/tasks/application/use-cases/toggle-task.use-case';
import { SendMessageUseCase } from '../modules/messages/application/use-cases/send-message.use-case';
import { ListMessagesUseCase } from '../modules/messages/application/use-cases/list-messages.use-case';
import { ListNotificationsUseCase } from '../modules/notifications/application/use-cases/list-notifications.use-case';
import { MarkAllReadUseCase } from '../modules/notifications/application/use-cases/mark-all-read.use-case';
import { ListRecentActivitiesUseCase } from '../modules/activities/application/use-cases/list-recent-activities.use-case';
import { ListCaseActivitiesUseCase } from '../modules/activities/application/use-cases/list-case-activities.use-case';
import { DashboardReportUseCase } from '../modules/reports/application/use-cases/dashboard-report.use-case';

/**
 * COMPOSITION ROOT — Inyección de dependencias manual y explícita.
 *
 * Es el ÚNICO lugar del sistema donde se conectan puertos con adaptadores.
 * Ventaja sobre un contenedor mágico: el grafo de dependencias es visible,
 * navegable y compilado — si falta una dependencia, TypeScript no compila.
 *
 * El RealtimePublisher se recibe como parámetro porque su adaptador (Socket.IO)
 * necesita el servidor HTTP, que se crea en el bootstrap.
 */
export function buildContainer(realtime: RealtimePublisher) {
  // ── Servicios compartidos ──
  const tokens: TokenSigner = new JwtTokenSigner(env.jwtSecret, env.jwtExpiresIn);
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

export type Container = ReturnType<typeof buildContainer>;
