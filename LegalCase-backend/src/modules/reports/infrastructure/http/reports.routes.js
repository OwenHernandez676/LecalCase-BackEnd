const { Router } = require('express');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const { requireAuth, requireRoles } = require('../../../../shared/middleware/auth.middleware');

function reportsRoutes(deps) {
  const router = Router();
  router.get('/dashboard', requireAuth(deps.tokens), requireRoles('administrador'),
    asyncHandler(async (_req, res) => { res.json(await deps.dashboard.execute()); }));
  return router;
}

module.exports = { reportsRoutes };
