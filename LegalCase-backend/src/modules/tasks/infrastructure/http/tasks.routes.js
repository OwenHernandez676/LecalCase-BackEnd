const { Router } = require('express');
const { CreateTaskDto } = require('../../application/dto/create-task.dto');
const { validateDto } = require('../../../../shared/middleware/validate.middleware');
const { validateObjectId } = require('../../../../shared/middleware/object-id.middleware');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const { requireAuth, requireRoles } = require('../../../../shared/middleware/auth.middleware');

function tasksRoutes(deps) {
  const router = Router();
  router.use(requireAuth(deps.tokens), requireRoles('administrador', 'abogado'));

  router.get('/', asyncHandler(async (req, res) => {
    res.json(await deps.listTasks.execute(req.query.asignadoA));
  }));
  router.post('/', validateDto(CreateTaskDto), asyncHandler(async (req, res) => {
    res.status(201).json(await deps.createTask.execute(req.body));
  }));
  router.patch('/:id/toggle', validateObjectId(), asyncHandler(async (req, res) => {
    res.json(await deps.toggleTask.execute(req.params.id));
  }));
  return router;
}

module.exports = { tasksRoutes };
