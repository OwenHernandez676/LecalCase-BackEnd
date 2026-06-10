import { Router } from 'express';
import { ListNotificationsUseCase } from '../../application/use-cases/list-notifications.use-case';
import { MarkAllReadUseCase } from '../../application/use-cases/mark-all-read.use-case';
import { asyncHandler } from '../../../../shared/middleware/error-handler';
import { requireAuth } from '../../../../shared/middleware/auth.middleware';
import { TokenSigner } from '../../../../shared/ports/token-signer.port';

export function notificationsRoutes(
  deps: { listNotifs: ListNotificationsUseCase; markAllRead: MarkAllReadUseCase; tokens: TokenSigner },
): Router {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  router.get('/', asyncHandler(async (req, res) => {
    res.json(await deps.listNotifs.execute(req.user!.sub));
  }));
  router.patch('/read-all', asyncHandler(async (req, res) => {
    res.json(await deps.markAllRead.execute(req.user!.sub));
  }));
  return router;
}
