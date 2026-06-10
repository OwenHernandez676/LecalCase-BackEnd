import { Router } from 'express';
import { ListTasksUseCase } from '../../application/use-cases/list-tasks.use-case';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { ToggleTaskUseCase } from '../../application/use-cases/toggle-task.use-case';
import { CreateTaskDto } from '../../application/dto/create-task.dto';
import { validateDto } from '../../../../shared/middleware/validate.middleware';
import { validateObjectId } from '../../../../shared/middleware/object-id.middleware';
import { asyncHandler } from '../../../../shared/middleware/error-handler';
import { requireAuth, requireRoles } from '../../../../shared/middleware/auth.middleware';
import { TokenSigner } from '../../../../shared/ports/token-signer.port';

export function tasksRoutes(
  deps: { listTasks: ListTasksUseCase; createTask: CreateTaskUseCase; toggleTask: ToggleTaskUseCase; tokens: TokenSigner },
): Router {
  const router = Router();
  router.use(requireAuth(deps.tokens), requireRoles('administrador', 'abogado'));

  router.get('/', asyncHandler(async (req, res) => {
    res.json(await deps.listTasks.execute(req.query['asignadoA'] as string | undefined));
  }));
  router.post('/', validateDto(CreateTaskDto), asyncHandler(async (req, res) => {
    res.status(201).json(await deps.createTask.execute(req.body));
  }));
  router.patch('/:id/toggle', validateObjectId(), asyncHandler(async (req, res) => {
    res.json(await deps.toggleTask.execute(req.params['id']));
  }));
  return router;
}
