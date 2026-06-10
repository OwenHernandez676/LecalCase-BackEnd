import { Router } from 'express';
import { ListRecentActivitiesUseCase } from '../../application/use-cases/list-recent-activities.use-case';
import { ListCaseActivitiesUseCase } from '../../application/use-cases/list-case-activities.use-case';
import { validateObjectId } from '../../../../shared/middleware/object-id.middleware';
import { asyncHandler } from '../../../../shared/middleware/error-handler';
import { requireAuth } from '../../../../shared/middleware/auth.middleware';
import { TokenSigner } from '../../../../shared/ports/token-signer.port';

export function activitiesRoutes(
  deps: { listRecent: ListRecentActivitiesUseCase; listByCase: ListCaseActivitiesUseCase; tokens: TokenSigner },
): Router {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  router.get('/', asyncHandler(async (req, res) => {
    const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 10;
    res.json(await deps.listRecent.execute(limit));
  }));
  router.get('/case/:id', validateObjectId(), asyncHandler(async (req, res) => {
    res.json(await deps.listByCase.execute(req.params['id']));
  }));
  return router;
}
