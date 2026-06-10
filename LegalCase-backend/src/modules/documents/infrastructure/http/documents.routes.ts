import { Router } from 'express';
import { ListDocumentsUseCase } from '../../application/use-cases/list-documents.use-case';
import { CreateDocumentUseCase } from '../../application/use-cases/create-document.use-case';
import { DeleteDocumentUseCase } from '../../application/use-cases/delete-document.use-case';
import { CreateDocumentDto } from '../../application/dto/create-document.dto';
import { validateDto } from '../../../../shared/middleware/validate.middleware';
import { validateObjectId } from '../../../../shared/middleware/object-id.middleware';
import { asyncHandler } from '../../../../shared/middleware/error-handler';
import { requireAuth, requireRoles } from '../../../../shared/middleware/auth.middleware';
import { TokenSigner } from '../../../../shared/ports/token-signer.port';

export function documentsRoutes(
  deps: { listDocs: ListDocumentsUseCase; createDoc: CreateDocumentUseCase; deleteDoc: DeleteDocumentUseCase; tokens: TokenSigner },
): Router {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  router.get('/', requireRoles('administrador', 'abogado', 'cliente'), asyncHandler(async (req, res) => {
    res.json(await deps.listDocs.execute(req.query['expedienteId'] as string | undefined));
  }));
  router.post('/', requireRoles('administrador', 'abogado'), validateDto(CreateDocumentDto), asyncHandler(async (req, res) => {
    res.status(201).json(await deps.createDoc.execute(req.body));
  }));
  router.delete('/:id', requireRoles('administrador', 'abogado'), validateObjectId(), asyncHandler(async (req, res) => {
    res.json(await deps.deleteDoc.execute(req.params['id']));
  }));
  return router;
}
