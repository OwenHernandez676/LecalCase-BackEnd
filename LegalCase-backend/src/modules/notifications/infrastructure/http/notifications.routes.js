const { Router } = require('express');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const { requireAuth } = require('../../../../shared/middleware/auth.middleware');

function notificationsRoutes(deps) {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  router.get('/', asyncHandler(async (req, res) => {
    res.json(await deps.listNotifs.execute(req.user.sub));
  }));
  router.patch('/read-all', asyncHandler(async (req, res) => {
    res.json(await deps.markAllRead.execute(req.user.sub));
  }));
  return router;
}

module.exports = { notificationsRoutes };
