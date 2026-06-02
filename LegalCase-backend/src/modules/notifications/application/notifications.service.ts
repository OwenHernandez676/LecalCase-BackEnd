import { Inject, Injectable } from '@nestjs/common';
import { NotificationRepository } from '../domain/ports/notification.repository';
import { NotificationType, AppNotification } from '../domain/entities/notification.entity';
import { UserRepository } from '../../users/domain/ports/user.repository';
import { RealtimeService } from '../../../realtime/realtime.service';

/**
 * Servicio de aplicación de notificaciones.
 * Otros casos de uso lo inyectan para persistir + difundir notificaciones,
 * sin acoplarse al repositorio ni al transporte de tiempo real.
 */
@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NotificationRepository) private readonly repo: NotificationRepository,
    @Inject(UserRepository) private readonly users: UserRepository,
    private readonly realtime: RealtimeService,
  ) {}

  /** Crea una notificación para un destinatario concreto (id de usuario). */
  async notify(destinatario: string, tipo: NotificationType, mensaje: string): Promise<AppNotification> {
    const n = await this.repo.create({ destinatario, tipo, mensaje, leida: false });
    this.realtime.publish('notification.created', n);
    return n;
  }

  /** Fan-out a todos los administradores activos. */
  async notifyAdmins(tipo: NotificationType, mensaje: string): Promise<void> {
    const admins = await this.users.findAll({ rol: 'administrador' });
    await Promise.all(
      admins.filter((a) => a.activo).map((a) => this.notify(a.id, tipo, mensaje)),
    );
  }
}
