import { Router } from 'express';
import { CreateRequestUseCase } from '../../application/use-cases/create-request.use-case';
import { ListRequestsUseCase } from '../../application/use-cases/list-requests.use-case';
import { ResolveRequestUseCase } from '../../application/use-cases/resolve-request.use-case';
import { CreateRequestDto } from '../../application/dto/create-request.dto';
import { ResolveRequestDto } from '../../application/dto/resolve-request.dto';
import { validateDto } from '../../../../shared/middleware/validate.middleware';
import { validateObjectId } from '../../../../shared/middleware/object-id.middleware';
import { asyncHandler } from '../../../../shared/middleware/error-handler';
import { requireAuth, requireRoles } from '../../../../shared/middleware/auth.middleware';
import { TokenSigner } from '../../../../shared/ports/token-signer.port';
import { RequestStatus } from '../../domain/entities/request.entity';

export function requestsRoutes(
  deps: {
    createRequest: CreateRequestUseCase;
    listRequests: ListRequestsUseCase;
    resolveRequest: ResolveRequestUseCase;
    tokens: TokenSigner;
  },
): Router {
  const router = Router();

  /** Endpoint público: cualquier cliente puede enviar su consulta legal. */
  router.post('/', validateDto(CreateRequestDto), asyncHandler(async (req, res) => {
    res.status(201).json(await deps.createRequest.execute(req.body));
  }));

  router.get('/', requireAuth(deps.tokens), requireRoles('administrador'), asyncHandler(async (req, res) => {
    res.json(await deps.listRequests.execute(req.query['estado'] as RequestStatus | undefined));
  }));

  router.patch('/:id/resolve', requireAuth(deps.tokens), requireRoles('administrador'),
    validateObjectId(), validateDto(ResolveRequestDto),
    asyncHandler(async (req, res) => { res.json(await deps.resolveRequest.execute(req.params['id'], req.body)); }));

  return router;
}
