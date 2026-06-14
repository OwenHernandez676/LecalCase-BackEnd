const { BadRequestError, NotFoundError } = require('../../../../shared/errors/app-error');
const { generateTempPassword } = require('../../../../shared/utils/password.util');
const { buildWelcomeClientEmail } = require('../../../../email/templates/welcome-client.template');

/**
 * Caso de uso: aprobar o rechazar una solicitud de servicios legales.
 *
 * RECHAZO: registra estado, fecha de resolución y observaciones (motivo).
 *
 * APROBACIÓN (flujo de negocio completo, orquestado en la capa de aplicación):
 *   1. Genera credenciales seguras y crea (o reutiliza) el usuario CLIENTE
 *      con el correo que el solicitante registró.
 *   2. Crea el expediente, enlazado al cliente por clienteId y al abogado asignado.
 *   3. Registra la actividad de creación en la línea de tiempo del expediente.
 *   4. Crea una notificación para el cliente.
 *   5. Envía el correo de bienvenida con sus credenciales (efecto secundario
 *      tolerante a fallos: si el SMTP falla, la aprobación NO se revierte).
 *   6. Registra trazabilidad de la operación (auditoría).
 *   7. Actualiza la solicitud (estado, expedienteId, clienteUserId, fecha).
 */
class ResolveRequestUseCase {
  /**
   * @param {import('../../domain/ports/request.repository').RequestRepository} requests
   * @param {import('../../../cases/application/use-cases/create-case.use-case').CreateCaseUseCase} createCase
   * @param {import('../../../users/domain/ports/user.repository').UserRepository} users
   * @param {import('../../../users/application/use-cases/create-user.use-case').CreateUserUseCase} createUser
   * @param {import('../../../activities/application/use-cases/create-activity.use-case').CreateActivityUseCase} createActivity
   * @param {import('../../../notifications/domain/ports/notification.repository').NotificationRepository} notifications
   * @param {import('../../../audit/application/use-cases/record-audit.use-case').RecordAuditUseCase} audit
   * @param {import('../../../../shared/ports/email-sender.port').EmailSender} email
   * @param {import('../../../../shared/ports/realtime-publisher.port').RealtimePublisher} realtime
   * @param {string} frontendUrl
   * @param {import('../../../auth/domain/ports/password-hasher.port').PasswordHasher} hasher
   */
  constructor(requests, createCase, users, createUser, createActivity, notifications, audit, email, realtime, frontendUrl, hasher, notify) {
    this.requests = requests;
    this.createCase = createCase;
    this.users = users;
    this.createUser = createUser;
    this.createActivity = createActivity;
    this.notifications = notifications;
    this.audit = audit;
    this.email = email;
    this.realtime = realtime;
    this.frontendUrl = frontendUrl;
    this.hasher = hasher;
    this.notify = notify;
  }

  async execute(id, dto) {
    const current = await this.requests.findById(id);
    if (!current) throw new NotFoundError('Solicitud no encontrada');
    if (current.estado !== 'Pendiente') throw new BadRequestError('La solicitud ya fue resuelta');

    const actor = dto.actor || 'Administrador';
    const ahora = new Date();

    // ───────────────────────── RECHAZO ─────────────────────────
    if (dto.estado === 'Rechazada') {
      const updated = await this.requests.update(id, {
        estado: 'Rechazada',
        motivo: dto.motivo,
        resueltaEn: ahora,
      });
      await this.audit.execute({
        actor, accion: 'solicitud.rechazada', entidad: 'solicitud', entidadId: id,
        detalle: `Solicitud ${current.codigo} rechazada${dto.motivo ? `: ${dto.motivo}` : ''}`,
        metadata: { cliente: current.cliente, correo: current.correo },
      });
      // Si el solicitante ya tiene cuenta (cliente recurrente), notifícale el rechazo.
      const existente = await this.users.findByEmail(current.correo);
      if (existente) {
        await this.notify.execute({
          destinatario: existente.id, tipo: 'solicitud',
          mensaje: `Su solicitud ${current.codigo} fue rechazada${dto.motivo ? `: ${dto.motivo}` : '.'}`,
        });
      }
      this.realtime.publish('request.resolved', { id, estado: 'Rechazada' });
      return updated;
    }

    // ───────────────────────── APROBACIÓN ─────────────────────────
    // 1. Usuario cliente: crear si no existe; si ya existe, resetear contraseña.
    //    Siempre generamos una contraseña temporal fresca para poder enviársela por correo.
    let clienteUser = await this.users.findByEmail(current.correo);
    const tempPassword = generateTempPassword();
    if (!clienteUser) {
      clienteUser = await this.createUser.execute({
        nombre: current.cliente,
        correo: current.correo,
        contrasena: tempPassword,
        rol: 'cliente',
        telefono: current.telefono,
        activo: true,
      });
    } else {
      // Actualiza la contraseña en BD para que el cliente pueda entrar con las nuevas credenciales.
      const hash = await this.hasher.hash(tempPassword);
      await this.users.update(clienteUser.id, { contrasena: hash, activo: true });
    }

    // 2. Expediente, enlazado al cliente y al abogado asignado (nombre + id).
    const created = await this.createCase.execute({
      titulo: `${current.tipo} — ${current.cliente}`,
      tipo: current.tipo,
      cliente: current.cliente,
      clienteId: clienteUser.id,
      abogado: dto.abogado,
      abogadoId: dto.abogadoId,
      prioridad: dto.prioridad ?? current.prioridad,
      fechaVencimiento: new Date(Date.now() + 90 * 86400000).toISOString(),
      descripcion: current.descripcion,
    });

    // 3. Actividad de creación (incluye observaciones del administrador si las hay).
    const detalleCreacion = dto.observaciones?.trim()
      ? `Expediente creado a partir de la solicitud ${current.codigo}. Observaciones: ${dto.observaciones.trim()}`
      : `Expediente creado a partir de la solicitud ${current.codigo}`;
    await this.createActivity.execute({
      expedienteId: created.id, tipo: 'creacion', descripcion: detalleCreacion, autor: actor,
    });

    // 4. Notificaciones EN VIVO: al cliente (su expediente) y al abogado (caso asignado).
    await this.notify.execute({
      destinatario: clienteUser.id, tipo: 'estado',
      mensaje: `Su solicitud fue aprobada. Se abrió el expediente ${created.codigo}.`,
    });
    if (dto.abogadoId) {
      await this.notify.execute({
        destinatario: dto.abogadoId, tipo: 'estado',
        mensaje: `Se le asignó el expediente ${created.codigo} — ${current.cliente}.`,
      });
    }

    // 5. Correo de bienvenida con credenciales (siempre: cliente nuevo o existente con password reset).
    const tpl = buildWelcomeClientEmail({
      nombre: current.cliente,
      correo: current.correo,
      contrasena: tempPassword,
      loginUrl: `${this.frontendUrl}/login`,
      codigoExpediente: created.codigo,
    });
    // Siempre imprime las credenciales en consola — fallback si el correo falla o va a spam.
    console.log(`[onboarding] 📧 Cuenta CLIENTE — correo: ${current.correo} · contraseña: ${tempPassword}`);
    const emailResult = await this.email.send({ to: current.correo, ...tpl });
    if (!emailResult.ok && !emailResult.skipped) {
      console.warn(`[onboarding] ⚠️  El correo al cliente falló. Usa las credenciales de consola.`);
    }

    // 6. Trazabilidad de la operación completa.
    await this.audit.execute({
      actor, accion: 'solicitud.aprobada', entidad: 'solicitud', entidadId: id,
      detalle: `Solicitud ${current.codigo} aprobada → expediente ${created.codigo}`,
      metadata: {
        cliente: current.cliente,
        correo: current.correo,
        clienteUserId: clienteUser.id,
        expedienteId: created.id,
        abogado: dto.abogado ?? null,
        abogadoId: dto.abogadoId ?? null,
        observaciones: dto.observaciones ?? null,
        cuentaCreada: true,
        correoEnviado: !!emailResult.ok,
      },
    });

    // 7. Actualiza la solicitud con la trazabilidad de la resolución.
    const updated = await this.requests.update(id, {
      estado: 'Aprobada',
      expedienteId: created.id,
      clienteUserId: clienteUser.id,
      resueltaEn: ahora,
    });
    this.realtime.publish('request.resolved', { id, estado: 'Aprobada', expedienteId: created.id });
    return updated;
  }
}

module.exports = { ResolveRequestUseCase };
