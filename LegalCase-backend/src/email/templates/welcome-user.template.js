/**
 * Plantilla del correo de bienvenida para una cuenta de personal del despacho
 * (abogado/administrador) creada por el administrador. Incluye nombre, correo,
 * contraseña temporal y URL de acceso.
 *
 * @param {object} data
 * @param {string} data.nombre
 * @param {string} data.correo
 * @param {string} data.contrasena
 * @param {string} data.rol
 * @param {string} data.loginUrl
 * @returns {{ subject: string, html: string, text: string }}
 */
function buildWelcomeUserEmail({ nombre, correo, contrasena, rol, loginUrl }) {
  const esAbogado = rol === 'abogado';
  const subject = esAbogado
    ? 'Bienvenido al equipo legal de LegalCase — Acceso a su cuenta'
    : 'Su cuenta de LegalCase ha sido creada';

  const intro = esAbogado
    ? 'Se ha creado su cuenta de <strong>abogado</strong> en LegalCase. Desde la plataforma podrá gestionar los expedientes que le sean asignados, su agenda, documentos y la comunicación con sus clientes.'
    : `Se ha creado su cuenta de <strong>${rol}</strong> en LegalCase.`;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#1a1a1a">
    <div style="background:#1f2a44;color:#fff;padding:24px 28px;border-radius:12px 12px 0 0">
      <h1 style="margin:0;font-size:20px;letter-spacing:.5px">LEGALCASE</h1>
      <p style="margin:4px 0 0;opacity:.8;font-size:13px">Gestión Legal</p>
    </div>
    <div style="border:1px solid #e6e6e6;border-top:none;padding:28px;border-radius:0 0 12px 12px">
      <h2 style="margin:0 0 12px;font-size:18px">Hola, ${nombre}</h2>
      <p style="font-size:14px;line-height:1.6">${intro}</p>

      <div style="background:#f6f7f9;border:1px solid #e6e6e6;border-radius:10px;padding:16px 18px;margin:18px 0">
        <p style="margin:0 0 8px;font-size:13px;color:#555">Sus credenciales de acceso</p>
        <p style="margin:0;font-size:14px"><strong>Correo:</strong> ${correo}</p>
        <p style="margin:6px 0 0;font-size:14px"><strong>Contraseña temporal:</strong>
          <span style="font-family:monospace;background:#fff;border:1px solid #ddd;border-radius:6px;padding:2px 8px">${contrasena}</span>
        </p>
      </div>

      <p style="font-size:14px;line-height:1.6">
        <strong>Cómo ingresar:</strong><br>
        1. Visite <a href="${loginUrl}" style="color:#b8860b">${loginUrl}</a><br>
        2. Inicie sesión con el correo y la contraseña temporal.<br>
        3. Por seguridad, cambie su contraseña tras el primer ingreso.
      </p>

      <a href="${loginUrl}" style="display:inline-block;margin-top:8px;background:#b8860b;color:#fff;text-decoration:none;padding:11px 22px;border-radius:8px;font-size:14px;font-weight:bold">
        Ingresar a la plataforma
      </a>

      <p style="font-size:12px;color:#888;margin-top:24px;line-height:1.5">
        Si usted no esperaba este mensaje, contacte al administrador del despacho.<br>
        Correo automático de LegalCase; por favor no responda a esta dirección.
      </p>
    </div>
  </div>`;

  const text =
    `Hola, ${nombre}\n\n` +
    `Se ha creado su cuenta de ${rol} en LegalCase.\n\n` +
    `Credenciales:\n  Correo: ${correo}\n  Contraseña temporal: ${contrasena}\n\n` +
    `Ingrese en: ${loginUrl}\nCambie su contraseña tras el primer ingreso.\n\n` +
    `LegalCase — Gestión Legal (correo automático, no responda).`;

  return { subject, html, text };
}

module.exports = { buildWelcomeUserEmail };
