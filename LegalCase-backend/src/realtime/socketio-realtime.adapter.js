const { Server: SocketIOServer } = require('socket.io');

/**
 * Adaptador Socket.IO del puerto RealtimePublisher.
 * Único lugar del sistema que conoce Socket.IO. Los casos de uso publican
 * eventos de dominio (case.created, request.resolved, …) sin saber el transporte.
 */
class SocketIORealtimeAdapter {
  /**
   * @param {import('http').Server} httpServer
   * @param {string} corsOrigin
   */
  constructor(httpServer, corsOrigin) {
    this.io = new SocketIOServer(httpServer, {
      path: '/realtime',
      cors: { origin: [corsOrigin, 'http://localhost:4200'], credentials: true },
    });
    this.io.on('connection', (socket) => {
      console.log(`[realtime] + conexión ${socket.id}`);
      socket.on('disconnect', () => console.log(`[realtime] - conexión ${socket.id}`));
    });
  }

  publish(topic, payload) {
    this.io.emit(topic, payload);
  }
}

/** Implementación nula para tests y para el seed (no abre sockets). */
class NoopRealtimePublisher {
  publish() { /* intencionalmente vacío */ }
}

module.exports = { SocketIORealtimeAdapter, NoopRealtimePublisher };
