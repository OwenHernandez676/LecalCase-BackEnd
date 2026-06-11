const { Router } = require('express');
const { SendMessageDto } = require('../../application/dto/send-message.dto');
const { validateDto } = require('../../../../shared/middleware/validate.middleware');
const { validateObjectId } = require('../../../../shared/middleware/object-id.middleware');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const { requireAuth } = require('../../../../shared/middleware/auth.middleware');

function messagesRoutes(deps) {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  router.get('/:expedienteId', validateObjectId('expedienteId'), asyncHandler(async (req, res) => {
    res.json(await deps.listMsgs.execute(req.params.expedienteId));
  }));
  router.post('/', validateDto(SendMessageDto), asyncHandler(async (req, res) => {
    res.status(201).json(await deps.sendMsg.execute(req.body));
  }));
  return router;
}

module.exports = { messagesRoutes };
