import { Router } from 'express';
import { CreateCaseUseCase } from '../../application/use-cases/create-case.use-case';
import { ListCasesUseCase } from '../../application/use-cases/list-cases.use-case';
import { FindCaseUseCase } from '../../application/use-cases/find-case.use-case';
import { UpdateCaseStatusUseCase } from '../../application/use-cases/update-case-status.use-case';
import { CreateCaseDto } from '../../application/dto/create-case.dto';
import { CaseFilterDto } from '../../application/dto/case-filter.dto';
import { UpdateCaseStatusDto } from '../../application/dto/update-case-status.dto';
import { validateDto } from '../../../../shared/middleware/validate.middleware';
import { validateObjectId } from '../../../../shared/middleware/object-id.middleware';
import { asyncHandler } from '../../../../shared/middleware/error-handler';
import { requireAuth, requireRoles } from '../../../../shared/middleware/auth.middleware';
import { TokenSigner } from '../../../../shared/ports/token-signer.port';

export function casesRoutes(
  deps: {
    createCase: CreateCaseUseCase;
    listCases: ListCasesUseCase;
    findCase: FindCaseUseCase;
    updateStatus: UpdateCaseStatusUseCase;
    tokens: TokenSigner;
  },
): Router {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  router.get('/', requireRoles('administrador', 'abogado', 'cliente'), validateDto(CaseFilterDto, 'query'),
    asyncHandler(async (req, res) => { res.json(await deps.listCases.execute(req.query as CaseFilterDto)); }));

  router.get('/:id', requireRoles('administrador', 'abogado', 'cliente'), validateObjectId(),
    asyncHandler(async (req, res) => { res.json(await deps.findCase.execute(req.params['id'])); }));

  router.post('/', requireRoles('administrador'), validateDto(CreateCaseDto),
    asyncHandler(async (req, res) => { res.status(201).json(await deps.createCase.execute(req.body)); }));

  router.patch('/:id/status', requireRoles('administrador', 'abogado'), validateObjectId(), validateDto(UpdateCaseStatusDto),
    asyncHandler(async (req, res) => { res.json(await deps.updateStatus.execute(req.params['id'], req.body)); }));

  return router;
}
