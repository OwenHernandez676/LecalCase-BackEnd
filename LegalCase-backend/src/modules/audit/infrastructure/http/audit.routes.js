const { Router } = require('express');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const { requireAuth, requireRoles } = require('../../../../shared/middleware/auth.middleware');

/** Rutas HTTP de auditoría. Solo el administrador consulta la bitácora. */
function auditRoutes(deps) {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  router.get('/', requireRoles('administrador'), asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    res.json(await deps.listAudit.execute(limit));
  }));

  return router;
}

module.exports = { auditRoutes };
