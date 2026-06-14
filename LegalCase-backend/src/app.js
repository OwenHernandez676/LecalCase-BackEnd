const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./shared/middleware/error-handler');
const { env } = require('./config/env');

const { authRoutes } = require('./modules/auth/infrastructure/http/auth.routes');
const { usersRoutes } = require('./modules/users/infrastructure/http/users.routes');
const { requestsRoutes } = require('./modules/requests/infrastructure/http/requests.routes');
const { casesRoutes } = require('./modules/cases/infrastructure/http/cases.routes');
const { documentsRoutes } = require('./modules/documents/infrastructure/http/documents.routes');
const { eventsRoutes } = require('./modules/events/infrastructure/http/events.routes');
const { messagesRoutes } = require('./modules/messages/infrastructure/http/messages.routes');
const { notificationsRoutes } = require('./modules/notifications/infrastructure/http/notifications.routes');
const { activitiesRoutes } = require('./modules/activities/infrastructure/http/activities.routes');
const { auditRoutes } = require('./modules/audit/infrastructure/http/audit.routes');
const { tasksRoutes } = require('./modules/tasks/infrastructure/http/tasks.routes');
/**
 * Fábrica de la aplicación Express.
 * Recibe el contenedor con los casos de uso ya cableados y monta las rutas.
 * Separar la fábrica del bootstrap permite testear la app sin abrir puertos.
 *
 * @param {ReturnType<import('./shared/container').buildContainer>} c
 */
function createApp(c) {
  const app = express();

  app.use(cors({ origin: [env.frontendUrl, 'http://localhost:4200'], credentials: true }));
  // Límite alto: los archivos (documentos y adjuntos de chat) viajan como base64 en el JSON.
  app.use(express.json({ limit: '30mb' }));

  app.get('/api/health', (_req, res) => { res.json({ status: 'ok', service: 'legalcase-backend' }); });

  app.use('/api/auth', authRoutes(c.auth.login, c.tokens));
  app.use('/api/users', usersRoutes({ ...c.users, tokens: c.tokens }));
  app.use('/api/requests', requestsRoutes({ ...c.requests, tokens: c.tokens }));
  app.use('/api/cases', casesRoutes({ ...c.cases, tokens: c.tokens }));
  app.use('/api/documents', documentsRoutes({ ...c.documents, tokens: c.tokens }));
  app.use('/api/events', eventsRoutes({ ...c.events, tokens: c.tokens }));
  app.use('/api/messages', messagesRoutes({ ...c.messages, tokens: c.tokens }));
  app.use('/api/notifications', notificationsRoutes({ ...c.notifications, tokens: c.tokens }));
  app.use('/api/activities', activitiesRoutes({ ...c.activities, tokens: c.tokens }));
  app.use('/api/audit', auditRoutes({ ...c.audit, tokens: c.tokens }));
  app.use('/api/tasks', tasksRoutes({ ...c.tasks, tokens: c.tokens }));

  app.use((_req, res) => { res.status(404).json({ statusCode: 404, message: 'Ruta no encontrada' }); });
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
