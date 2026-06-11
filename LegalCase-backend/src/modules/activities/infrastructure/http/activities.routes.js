const { Router } = require('express');
const { validateObjectId } = require('../../../../shared/middleware/object-id.middleware');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const { requireAuth } = require('../../../../shared/middleware/auth.middleware');

function activitiesRoutes(deps) {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  router.get('/', asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    res.json(await deps.listRecent.execute(limit));
  }));
  router.get('/case/:id', validateObjectId(), asyncHandler(async (req, res) => {
    res.json(await deps.listByCase.execute(req.params.id));
  }));
  return router;
}

module.exports = { activitiesRoutes };
