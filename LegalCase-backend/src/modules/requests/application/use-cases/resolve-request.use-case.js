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
   */
  constructor(requests, createCase, users, createUser, createActivity, notifications, audit, email, realtime, frontendUrl) {
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
      this.realtime.publish('request.resolved', { id, estado: 'Rechazada' });
      return updated;
    }

    // ───────────────────────── APROBACIÓN ─────────────────────────
    // 1. Usuario cliente (crear o reutilizar por correo).
    let clienteUser = await this.users.findByEmail(current.correo);
    let tempPassword = null;
    if (!clienteUser) {
      tempPassword = generateTempPassword();
      clienteUser = await this.createUser.execute({
        nombre: current.cliente,
        correo: current.correo,
        contrasena: tempPassword,
        rol: 'cliente',
        telefono: current.telefono,
        activo: true,
      });
    }

    // 2. Expediente, enlazado al cliente y al abogado asignado.
    const created = await this.createCase.execute({
      titulo: `${current.tipo} — ${current.cliente}`,
      tipo: current.tipo,
      cliente: current.cliente,
      clienteId: clienteUser.id,
      abogado: dto.abogado,
      prioridad: dto.prioridad ?? current.prioridad,
      fechaVencimiento: new Date(Date.now() + 90 * 86400000).toISOString(),
      descripcion: current.descripcion,
    });

    // 3. Actividad de creación en la línea de tiempo.
    await this.createActivity.execute({
      expedienteId: created.id,
      tipo: 'creacion',
      descripcion: `Expediente creado a partir de la solicitud ${current.codigo}`,
      autor: actor,
    });

    // 4. Notificación para el cliente (destinatario = id del usuario cliente).
    try {
      await this.notifications.create({
        destinatario: clienteUser.id,
        tipo: 'estado',
        mensaje: `Su solicitud fue aprobada. Se abrió el expediente ${created.codigo}.`,
        leida: false,
      });
    } catch (e) { console.error('[notif] no se pudo crear la notificación:', e.message); }

    // 5. Correo de bienvenida (solo si se generó una contraseña nueva).
    let emailResult = { ok: false, skipped: true };
    if (tempPassword) {
      const tpl = buildWelcomeClientEmail({
        nombre: current.cliente,
        correo: current.correo,
        contrasena: tempPassword,
        loginUrl: `${this.frontendUrl}/login`,
        codigoExpediente: created.codigo,
      });
      emailResult = await this.email.send({ to: current.correo, ...tpl });
      // Fallback operativo: si el SMTP no está configurado, deja las credenciales
      // en el log del servidor para no bloquear el onboarding del cliente.
      if (emailResult.skipped) {
        console.log(`[onboarding] Cuenta de cliente lista — correo: ${current.correo} · contraseña temporal: ${tempPassword}`);
      }
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
        cuentaCreada: !!tempPassword,
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
