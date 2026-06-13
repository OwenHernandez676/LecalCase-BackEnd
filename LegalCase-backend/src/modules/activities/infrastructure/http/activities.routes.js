const { Router } = require('express');
const { CreateActivityDto } = require('../../application/dto/create-activity.dto');
const { validateDto } = require('../../../../shared/middleware/validate.middleware');
const { validateObjectId } = require('../../../../shared/middleware/object-id.middleware');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const { requireAuth, requireRoles } = require('../../../../shared/middleware/auth.middleware');

function activitiesRoutes(deps) {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  // Actividad reciente del despacho: solo gestión interna (el cliente NO lo ve).
  router.get('/', requireRoles('administrador', 'abogado'), asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    res.json(await deps.listRecent.execute(limit));
  }));

  // Línea de tiempo de un expediente. El cliente solo accede a la de SUS expedientes
  // (el caso de uso valida la propiedad por clienteId).
  router.get('/case/:id', validateObjectId(), asyncHandler(async (req, res) => {
    res.json(await deps.listByCase.execute(req.params.id, req.user));
  }));

  // Registrar una actualización en la línea de tiempo (abogado/administrador).
  router.post('/', requireRoles('administrador', 'abogado'), validateDto(CreateActivityDto),
    asyncHandler(async (req, res) => {
      res.status(201).json(await deps.createActivity.execute(req.body));
    }));

  return router;
}

module.exports = { activitiesRoutes };
