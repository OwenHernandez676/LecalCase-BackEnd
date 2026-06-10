import { Router } from 'express';
import { ListEventsUseCase } from '../../application/use-cases/list-events.use-case';
import { CreateEventUseCase } from '../../application/use-cases/create-event.use-case';
import { DeleteEventUseCase } from '../../application/use-cases/delete-event.use-case';
import { CreateEventDto } from '../../application/dto/create-event.dto';
import { validateDto } from '../../../../shared/middleware/validate.middleware';
import { validateObjectId } from '../../../../shared/middleware/object-id.middleware';
import { asyncHandler } from '../../../../shared/middleware/error-handler';
import { requireAuth, requireRoles } from '../../../../shared/middleware/auth.middleware';
import { TokenSigner } from '../../../../shared/ports/token-signer.port';

export function eventsRoutes(
  deps: { listEvents: ListEventsUseCase; createEvent: CreateEventUseCase; deleteEvent: DeleteEventUseCase; tokens: TokenSigner },
): Router {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  router.get('/', requireRoles('administrador', 'abogado', 'cliente'), asyncHandler(async (req, res) => {
    res.json(await deps.listEvents.execute(req.query['from'] as string | undefined, req.query['to'] as string | undefined));
  }));
  router.post('/', requireRoles('administrador', 'abogado'), validateDto(CreateEventDto), asyncHandler(async (req, res) => {
    res.status(201).json(await deps.createEvent.execute(req.body));
  }));
  router.delete('/:id', requireRoles('administrador', 'abogado'), validateObjectId(), asyncHandler(async (req, res) => {
    res.json(await deps.deleteEvent.execute(req.params['id']));
  }));
  return router;
}
