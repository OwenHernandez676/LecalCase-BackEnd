/**
 * Puerto de salida para publicar eventos en tiempo real.
 * Los casos de uso dependen de esta abstracción; el adaptador concreto
 * (Socket.IO) vive en infraestructura. Mejora sobre la versión anterior:
 * la capa de aplicación ni siquiera conoce la palabra "socket".
 */
export interface RealtimePublisher {
  publish<T>(topic: string, payload: T): void;
}
