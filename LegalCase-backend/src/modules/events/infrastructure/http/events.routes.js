const { Router } = require('express');
const { CreateEventDto } = require('../../application/dto/create-event.dto');
const { validateDto } = require('../../../../shared/middleware/validate.middleware');
const { validateObjectId } = require('../../../../shared/middleware/object-id.middleware');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const { requireAuth, requireRoles } = require('../../../../shared/middleware/auth.middleware');

function eventsRoutes(deps) {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  router.get('/', requireRoles('administrador', 'abogado', 'cliente'), asyncHandler(async (req, res) => {
    res.json(await deps.listEvents.execute(req.query.from, req.query.to));
  }));
  router.post('/', requireRoles('administrador', 'abogado'), validateDto(CreateEventDto), asyncHandler(async (req, res) => {
    res.status(201).json(await deps.createEvent.execute(req.body));
  }));
  router.delete('/:id', requireRoles('administrador', 'abogado'), validateObjectId(), asyncHandler(async (req, res) => {
    res.json(await deps.deleteEvent.execute(req.params.id));
  }));
  return router;
}

module.exports = { eventsRoutes };
