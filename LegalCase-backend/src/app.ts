import express, { Application } from 'express';
import cors from 'cors';
import { Container } from './shared/container';
import { errorHandler } from './shared/middleware/error-handler';
import { env } from './config/env';

import { authRoutes } from './modules/auth/infrastructure/http/auth.routes';
import { usersRoutes } from './modules/users/infrastructure/http/users.routes';
import { requestsRoutes } from './modules/requests/infrastructure/http/requests.routes';
import { casesRoutes } from './modules/cases/infrastructure/http/cases.routes';
import { documentsRoutes } from './modules/documents/infrastructure/http/documents.routes';
import { eventsRoutes } from './modules/events/infrastructure/http/events.routes';
import { tasksRoutes } from './modules/tasks/infrastructure/http/tasks.routes';
import { messagesRoutes } from './modules/messages/infrastructure/http/messages.routes';
import { notificationsRoutes } from './modules/notifications/infrastructure/http/notifications.routes';
import { activitiesRoutes } from './modules/activities/infrastructure/http/activities.routes';
import { reportsRoutes } from './modules/reports/infrastructure/http/reports.routes';

/**
 * Fábrica de la aplicación Express.
 * Recibe el contenedor con los casos de uso ya cableados y monta las rutas.
 * Separar la fábrica del bootstrap permite testear la app sin abrir puertos.
 */
export function createApp(c: Container): Application {
  const app = express();

  app.use(cors({ origin: [env.frontendUrl, 'http://localhost:4200'], credentials: true }));
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => { res.json({ status: 'ok', service: 'legalcase-backend' }); });

  app.use('/api/auth', authRoutes(c.auth.login, c.tokens));
  app.use('/api/users', usersRoutes({ ...c.users, tokens: c.tokens }));
  app.use('/api/requests', requestsRoutes({ ...c.requests, tokens: c.tokens }));
  app.use('/api/cases', casesRoutes({ ...c.cases, tokens: c.tokens }));
  app.use('/api/documents', documentsRoutes({ ...c.documents, tokens: c.tokens }));
  app.use('/api/events', eventsRoutes({ ...c.events, tokens: c.tokens }));
  app.use('/api/tasks', tasksRoutes({ ...c.tasks, tokens: c.tokens }));
  app.use('/api/messages', messagesRoutes({ ...c.messages, tokens: c.tokens }));
  app.use('/api/notifications', notificationsRoutes({ ...c.notifications, tokens: c.tokens }));
  app.use('/api/activities', activitiesRoutes({ ...c.activities, tokens: c.tokens }));
  app.use('/api/reports', reportsRoutes({ ...c.reports, tokens: c.tokens }));

  app.use((_req, res) => { res.status(404).json({ statusCode: 404, message: 'Ruta no encontrada' }); });
  app.use(errorHandler);

  return app;
}
