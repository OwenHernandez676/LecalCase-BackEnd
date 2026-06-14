const { Router } = require('express');
const { CreateCaseDto } = require('../../application/dto/create-case.dto');
const { CaseFilterDto } = require('../../application/dto/case-filter.dto');
const { UpdateCaseStatusDto } = require('../../application/dto/update-case-status.dto');
const { validateDto } = require('../../../../shared/middleware/validate.middleware');
const { validateObjectId } = require('../../../../shared/middleware/object-id.middleware');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const { requireAuth, requireRoles } = require('../../../../shared/middleware/auth.middleware');

function casesRoutes(deps) {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  router.get('/', requireRoles('administrador', 'abogado', 'cliente'), validateDto(CaseFilterDto, 'query'),
    asyncHandler(async (req, res) => { res.json(await deps.listCases.execute(req.query, req.user)); }));

  router.get('/:id', requireRoles('administrador', 'abogado', 'cliente'), validateObjectId(),
    asyncHandler(async (req, res) => { res.json(await deps.findCase.execute(req.params.id, req.user)); }));

  router.post('/', requireRoles('administrador'), validateDto(CreateCaseDto),
    asyncHandler(async (req, res) => { res.status(201).json(await deps.createCase.execute(req.body)); }));

  router.patch('/:id/status', requireRoles('administrador', 'abogado'), validateObjectId(), validateDto(UpdateCaseStatusDto),
    asyncHandler(async (req, res) => { res.json(await deps.updateStatus.execute(req.params.id, req.body, req.user)); }));

  return router;
}

module.exports = { casesRoutes };
