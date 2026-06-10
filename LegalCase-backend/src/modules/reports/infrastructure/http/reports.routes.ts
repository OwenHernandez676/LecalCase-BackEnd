import { Router } from 'express';
import { DashboardReportUseCase } from '../../application/use-cases/dashboard-report.use-case';
import { asyncHandler } from '../../../../shared/middleware/error-handler';
import { requireAuth, requireRoles } from '../../../../shared/middleware/auth.middleware';
import { TokenSigner } from '../../../../shared/ports/token-signer.port';

export function reportsRoutes(deps: { dashboard: DashboardReportUseCase; tokens: TokenSigner }): Router {
  const router = Router();
  router.get('/dashboard', requireAuth(deps.tokens), requireRoles('administrador'),
    asyncHandler(async (_req, res) => { res.json(await deps.dashboard.execute()); }));
  return router;
}
