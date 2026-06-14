const { generateTempPassword } = require('../../../../shared/utils/password.util');
const { buildWelcomeUserEmail } = require('../../../../email/templates/welcome-user.template');

/**
 * Caso de uso: alta de personal del despacho (abogado/administrador) por el
 * administrador, con onboarding completo:
 *   1. Genera contraseña temporal segura (si no se proporciona una).
 *   2. Crea el usuario (CreateUserUseCase hashea la contraseña).
 *   3. Envía correo de bienvenida con credenciales (tolerante a fallos de SMTP).
 *   4. Crea una notificación de bienvenida para el nuevo usuario.
 *   5. Registra la trazabilidad (auditoría).
 */
class OnboardUserUseCase {
  /**
   * @param {import('./create-user.use-case').CreateUserUseCase} createUser
   * @param {import('../../../notifications/domain/ports/notification.repository').NotificationRepository} notifications
   * @param {import('../../../audit/application/use-cases/record-audit.use-case').RecordAuditUseCase} audit
   * @param {import('../../../../shared/ports/email-sender.port').EmailSender} email
   * @param {string} frontendUrl
   */
  constructor(createUser, notifications, audit, email, frontendUrl, notify) {
    this.createUser = createUser;
    this.notifications = notifications;
    this.audit = audit;
    this.email = email;
    this.frontendUrl = frontendUrl;
    this.notify = notify;
  }

  /**
   * @param {object} dto Datos del usuario (sin contraseña: se genera).
   * @param {string} actor Administrador que ejecuta la operación (para auditoría).
   */
  async execute(dto, actor) {
    const tempPassword = dto.contrasena || generateTempPassword();
    const user = await this.createUser.execute({ ...dto, contrasena: tempPassword });

    // Correo de bienvenida con credenciales.
    const tpl = buildWelcomeUserEmail({
      nombre: user.nombre, correo: user.correo, contrasena: tempPassword,
      rol: user.rol, loginUrl: `${this.frontendUrl}/login`,
    });
    // Siempre imprime en consola como fallback (útil si el correo va a spam o falla).
    console.log(`[onboarding] 📧 Cuenta ${user.rol.toUpperCase()} — correo: ${user.correo} · contraseña: ${tempPassword}`);
    const emailResult = await this.email.send({ to: user.correo, ...tpl });
    if (!emailResult.ok && !emailResult.skipped) {
      console.warn(`[onboarding] ⚠️  El correo al ${user.rol} falló. Usa las credenciales de consola.`);
    }

    // Notificación de bienvenida EN VIVO para el propio usuario.
    await this.notify.execute({
      destinatario: user.id,
      tipo: 'estado',
      mensaje: `Bienvenido a LegalCase. Su cuenta de ${user.rol} fue creada.`,
    });

    // Trazabilidad.
    await this.audit.execute({
      actor: actor || 'Administrador', accion: 'usuario.creado', entidad: 'usuario', entidadId: user.id,
      detalle: `Cuenta de ${user.rol} creada para ${user.correo}`,
      metadata: { rol: user.rol, correoEnviado: !!emailResult.ok },
    });

    return user;
  }
}

module.exports = { OnboardUserUseCase };
