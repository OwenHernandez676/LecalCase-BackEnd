export type NotificationType = 'comentario' | 'audiencia' | 'documento' | 'estado' | 'solicitud';

export class AppNotification {
  constructor(
    public readonly id: string,
    public readonly destinatario: string,
    public readonly tipo: NotificationType,
    public readonly mensaje: string,
    public readonly leida: boolean,
    public readonly createdAt?: Date,
  ) {}
}
