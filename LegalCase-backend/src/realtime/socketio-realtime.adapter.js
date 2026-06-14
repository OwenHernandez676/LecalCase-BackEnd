const { Server: SocketIOServer } = require('socket.io');

/**
 * Adaptador Socket.IO del puerto RealtimePublisher.
 * Único lugar del sistema que conoce Socket.IO. Los casos de uso publican
 * eventos de dominio (case.created, request.resolved, …) sin saber el transporte.
 *
 * Cada socket se autentica con el mismo JWT de la API (handshake.auth.token) y
 * se une a salas privadas `user:<id>` y `role:<rol>`. Eso permite entregar
 * notificaciones SOLO a su destinatario (publishToUser) sin filtrarlas a todos
 * los clientes conectados.
 */
class SocketIORealtimeAdapter {
  /**
   * @param {import('http').Server} httpServer
   * @param {string} corsOrigin
   * @param {import('../shared/ports/token-signer.port').TokenSigner} tokens Verificador de JWT.
   */
  constructor(httpServer, corsOrigin, tokens) {
    this.tokens = tokens;
    this.io = new SocketIOServer(httpServer, {
      path: '/realtime',
      cors: { origin: [corsOrigin, 'http://localhost:4200'], credentials: true },
    });

    // Autenticación del handshake: sin token válido no se permite la conexión.
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Token no proporcionado'));
        const user = await this.tokens.verify(token);
        socket.data.user = user;
        next();
      } catch {
        next(new Error('Token inválido'));
      }
    });

    this.io.on('connection', (socket) => {
      const { sub, rol } = socket.data.user ?? {};
      if (sub) socket.join(`user:${sub}`);
      if (rol) socket.join(`role:${rol}`);
      console.log(`[realtime] + conexión ${socket.id} (user:${sub} · ${rol})`);
      socket.on('disconnect', () => console.log(`[realtime] - conexión ${socket.id}`));
    });
  }

  /** Difusión global: eventos de dominio que cualquier cliente puede reflejar. */
  publish(topic, payload) {
    this.io.emit(topic, payload);
  }

  /** Entrega dirigida a un único usuario (su sala privada). */
  publishToUser(userId, topic, payload) {
    if (!userId) return;
    this.io.to(`user:${userId}`).emit(topic, payload);
  }

  /** Entrega dirigida a todos los usuarios de un rol (p. ej. todos los administradores). */
  publishToRole(rol, topic, payload) {
    if (!rol) return;
    this.io.to(`role:${rol}`).emit(topic, payload);
  }
}

/** Implementación nula para tests y para el seed (no abre sockets). */
class NoopRealtimePublisher {
  publish() { /* intencionalmente vacío */ }
  publishToUser() { /* intencionalmente vacío */ }
  publishToRole() { /* intencionalmente vacío */ }
}

module.exports = { SocketIORealtimeAdapter, NoopRealtimePublisher };
