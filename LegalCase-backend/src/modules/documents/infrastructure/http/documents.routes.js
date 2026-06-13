const { Router } = require('express');
const { CreateDocumentDto } = require('../../application/dto/create-document.dto');
const { validateDto } = require('../../../../shared/middleware/validate.middleware');
const { validateObjectId } = require('../../../../shared/middleware/object-id.middleware');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const { requireAuth, requireRoles } = require('../../../../shared/middleware/auth.middleware');

function documentsRoutes(deps) {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  router.get('/', requireRoles('administrador', 'abogado', 'cliente'), asyncHandler(async (req, res) => {
    res.json(await deps.listDocs.execute(req.query.expedienteId, req.user));
  }));
  router.post('/', requireRoles('administrador', 'abogado'), validateDto(CreateDocumentDto), asyncHandler(async (req, res) => {
    res.status(201).json(await deps.createDoc.execute(req.body));
  }));
  router.delete('/:id', requireRoles('administrador', 'abogado'), validateObjectId(), asyncHandler(async (req, res) => {
    res.json(await deps.deleteDoc.execute(req.params.id));
  }));
  return router;
}

module.exports = { documentsRoutes };
