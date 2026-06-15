/**
 * Diagnóstico rápido de SMTP.
 * Ejecutar: node scripts/test-smtp.js
 *
 * Carga el mismo .env que usa el servidor y envía un correo de prueba
 * a la propia cuenta SMTP_USER. Si falla, imprime el error completo
 * para identificar si la App Password de Gmail fue revocada.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const nodemailer = require('nodemailer');

const cfg = {
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT ?? '465', 10),
  secure: (process.env.SMTP_SECURE ?? 'true') === 'true',
  user:   process.env.SMTP_USER,
  pass:   process.env.SMTP_PASS,
  from:   process.env.MAIL_FROM ?? process.env.SMTP_USER,
};

console.log('\n── Configuración SMTP leída del .env ──');
console.log('  HOST  :', cfg.host   || '(vacío — ¡falta SMTP_HOST!)');
console.log('  PORT  :', cfg.port);
console.log('  SECURE:', cfg.secure);
console.log('  USER  :', cfg.user   || '(vacío — ¡falta SMTP_USER!)');
console.log('  PASS  :', cfg.pass   ? '****' + cfg.pass.slice(-4) : '(vacío — ¡falta SMTP_PASS!)');
console.log('  FROM  :', cfg.from);
console.log('────────────────────────────────────────\n');

if (!cfg.host || !cfg.user || !cfg.pass) {
  console.error('  Faltan variables SMTP en .env. Verifica SMTP_HOST, SMTP_USER y SMTP_PASS.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host:   cfg.host,
  port:   cfg.port,
  secure: cfg.secure,
  auth:   { user: cfg.user, pass: cfg.pass },
});

(async () => {
  console.log('⏳  Verificando conexión SMTP...');
  try {
    await transporter.verify();
    console.log('  Conexión SMTP OK — las credenciales son válidas.\n');
  } catch (err) {
    console.error('  Fallo en verify():');
    console.error('    Código  :', err.code);
    console.error('    Mensaje :', err.message);
    if (err.responseCode) console.error('    Respuesta SMTP:', err.responseCode, err.response);
    console.error('\n  Si el código es EAUTH o 535: la App Password de Gmail fue revocada.');
    console.error('    → Ve a myaccount.google.com > Seguridad > Verificación en 2 pasos > Contraseñas de aplicación');
    console.error('    → Crea una nueva contraseña de aplicación (16 dígitos) y actualiza SMTP_PASS en .env');
    process.exit(1);
  }

  console.log(`⏳  Enviando correo de prueba a ${cfg.user}...`);
  try {
    const info = await transporter.sendMail({
      from:    cfg.from,
      to:      cfg.user,
      subject: '[LegalCase] Prueba SMTP — ' + new Date().toLocaleString('es-HN'),
      text:    'Si recibes este correo, el SMTP de LegalCase está configurado correctamente.',
      html:    '<p>Si recibes este correo, el SMTP de <strong>LegalCase</strong> está configurado correctamente.</p>',
    });
    console.log('  Correo enviado. ID:', info.messageId);
    console.log('    Revisa la bandeja de entrada de', cfg.user);
  } catch (err) {
    console.error('  Fallo al enviar:');
    console.error('    Código  :', err.code);
    console.error('    Mensaje :', err.message);
    if (err.responseCode) console.error('    Respuesta SMTP:', err.responseCode, err.response);
    process.exit(1);
  }
})();
