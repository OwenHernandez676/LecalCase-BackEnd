const { Router } = require('express');
const { CreateRequestDto } = require('../../application/dto/create-request.dto');
const { ResolveRequestDto } = require('../../application/dto/resolve-request.dto');
const { validateDto } = require('../../../../shared/middleware/validate.middleware');
const { validateObjectId } = require('../../../../shared/middleware/object-id.middleware');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const { requireAuth, requireRoles } = require('../../../../shared/middleware/auth.middleware');

function requestsRoutes(deps) {
  const router = Router();

  /** Endpoint público: cualquier cliente puede enviar su consulta legal. */
  router.post('/', validateDto(CreateRequestDto), asyncHandler(async (req, res) => {
    res.status(201).json(await deps.createRequest.execute(req.body));
  }));

  router.get('/', requireAuth(deps.tokens), requireRoles('administrador'), asyncHandler(async (req, res) => {
    res.json(await deps.listRequests.execute(req.query.estado));
  }));

  router.patch('/:id/resolve', requireAuth(deps.tokens), requireRoles('administrador'),
    validateObjectId(), validateDto(ResolveRequestDto),
    asyncHandler(async (req, res) => { res.json(await deps.resolveRequest.execute(req.params.id, req.body)); }));

  return router;
}

module.exports = { requestsRoutes };
