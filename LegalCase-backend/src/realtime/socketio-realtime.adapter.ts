import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { RealtimePublisher } from '../shared/ports/realtime-publisher.port';

/**
 * Adaptador Socket.IO del puerto RealtimePublisher.
 * Único lugar del sistema que conoce Socket.IO. Los casos de uso publican
 * eventos de dominio (case.created, request.resolved, …) sin saber el transporte.
 */
export class SocketIORealtimeAdapter implements RealtimePublisher {
  private readonly io: SocketIOServer;

  constructor(httpServer: HttpServer, corsOrigin: string) {
    this.io = new SocketIOServer(httpServer, {
      path: '/realtime',
      cors: { origin: [corsOrigin, 'http://localhost:4200'], credentials: true },
    });
    this.io.on('connection', (socket) => {
      console.log(`[realtime] + conexión ${socket.id}`);
      socket.on('disconnect', () => console.log(`[realtime] - conexión ${socket.id}`));
    });
  }

  publish<T>(topic: string, payload: T): void {
    this.io.emit(topic, payload);
  }
}

/** Implementación nula para tests y para el seed (no abre sockets). */
export class NoopRealtimePublisher implements RealtimePublisher {
  publish(): void { /* intencionalmente vacío */ }
}
