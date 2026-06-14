const { Router } = require('express');
const { SendMessageDto } = require('../../application/dto/send-message.dto');
const { validateDto } = require('../../../../shared/middleware/validate.middleware');
const { validateObjectId } = require('../../../../shared/middleware/object-id.middleware');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const { requireAuth } = require('../../../../shared/middleware/auth.middleware');

function messagesRoutes(deps) {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  // Descarga real del adjunto de un mensaje (con verificación de acceso al caso).
  router.get('/:id/attachment', validateObjectId(), asyncHandler(async (req, res) => {
    const file = await deps.downloadAttachment.execute(req.params.id, req.user);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.nombre)}"`);
    res.send(file.contenido);
  }));

  router.get('/:expedienteId', validateObjectId('expedienteId'), asyncHandler(async (req, res) => {
    res.json(await deps.listMsgs.execute(req.params.expedienteId, req.user));
  }));
  router.post('/', validateDto(SendMessageDto), asyncHandler(async (req, res) => {
    res.status(201).json(await deps.sendMsg.execute(req.body, req.user));
  }));
  return router;
}

module.exports = { messagesRoutes };
