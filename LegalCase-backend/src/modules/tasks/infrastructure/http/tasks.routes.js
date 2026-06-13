const { Router } = require('express');
const { CreateTaskDto } = require('../../application/dto/create-task.dto');
const { UpdateTaskDto } = require('../../application/dto/update-task.dto');
const { validateDto } = require('../../../../shared/middleware/validate.middleware');
const { validateObjectId } = require('../../../../shared/middleware/object-id.middleware');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const { requireAuth, requireRoles } = require('../../../../shared/middleware/auth.middleware');

/**
 * Rutas del tablero Kanban de tareas.
 *  - GET: cualquier rol autenticado (con aislamiento en el caso de uso).
 *  - POST/PATCH/DELETE: solo administrador y abogado (el cliente es de solo lectura).
 */
function tasksRoutes(deps) {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  router.get('/', asyncHandler(async (req, res) => {
    res.json(await deps.listTasks.execute(req.query.expedienteId, req.user));
  }));

  router.post('/', requireRoles('administrador', 'abogado'), validateDto(CreateTaskDto),
    asyncHandler(async (req, res) => {
      res.status(201).json(await deps.createTask.execute(req.body, req.user));
    }));

  router.patch('/:id', requireRoles('administrador', 'abogado'), validateObjectId(), validateDto(UpdateTaskDto),
    asyncHandler(async (req, res) => {
      res.json(await deps.updateTask.execute(req.params.id, req.body, req.user));
    }));

  router.delete('/:id', requireRoles('administrador', 'abogado'), validateObjectId(),
    asyncHandler(async (req, res) => {
      res.json(await deps.deleteTask.execute(req.params.id, req.user));
    }));

  return router;
}

module.exports = { tasksRoutes };
