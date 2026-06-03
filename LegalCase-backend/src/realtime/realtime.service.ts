import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

/**
 * Servicio aplicación-side para emitir eventos en tiempo real.
 * Los casos de uso lo inyectan en vez de depender del gateway directamente,
 * lo que mantiene la capa de aplicación libre de detalles de transporte.
 */
@Injectable()
export class RealtimeService {
  constructor(private readonly gateway: RealtimeGateway) {}
  publish<T>(topic: string, payload: T): void { this.gateway.emit(topic, payload); }
}
