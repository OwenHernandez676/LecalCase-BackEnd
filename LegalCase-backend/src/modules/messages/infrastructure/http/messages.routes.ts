import { Router } from 'express';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { ListMessagesUseCase } from '../../application/use-cases/list-messages.use-case';
import { SendMessageDto } from '../../application/dto/send-message.dto';
import { validateDto } from '../../../../shared/middleware/validate.middleware';
import { validateObjectId } from '../../../../shared/middleware/object-id.middleware';
import { asyncHandler } from '../../../../shared/middleware/error-handler';
import { requireAuth } from '../../../../shared/middleware/auth.middleware';
import { TokenSigner } from '../../../../shared/ports/token-signer.port';

export function messagesRoutes(
  deps: { sendMsg: SendMessageUseCase; listMsgs: ListMessagesUseCase; tokens: TokenSigner },
): Router {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  router.get('/:expedienteId', validateObjectId('expedienteId'), asyncHandler(async (req, res) => {
    res.json(await deps.listMsgs.execute(req.params['expedienteId']));
  }));
  router.post('/', validateDto(SendMessageDto), asyncHandler(async (req, res) => {
    res.status(201).json(await deps.sendMsg.execute(req.body));
  }));
  return router;
}
