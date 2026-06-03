import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * Gateway de WebSockets para LEXVANTE.
 * Canal único; los eventos llevan un "topic" semántico (case.updated,
 * request.created, etc.) consumido por el frontend para sincronizar el UI.
 */
@WebSocketGateway({ cors: { origin: '*' }, namespace: '/realtime' })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly log = new Logger('Realtime');

  handleConnection(client: Socket): void { this.log.log(`+ conn ${client.id}`); }
  handleDisconnect(client: Socket): void { this.log.log(`- conn ${client.id}`); }

  /** Difunde un evento de dominio a todos los clientes conectados. */
  emit<T>(topic: string, payload: T): void {
    this.server?.emit(topic, payload);
  }
}
