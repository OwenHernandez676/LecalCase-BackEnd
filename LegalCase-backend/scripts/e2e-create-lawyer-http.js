/**
 * E2E por HTTP REAL del alta de abogado (reproduce el escenario del panel admin):
 *   login admin → POST /api/users SIN contraseña → correo (intentado) → login del abogado.
 * Atraviesa la validación de DTO real (la capa que daba "contrasena es requerido").
 * Limpia el abogado de prueba al final.
 *
 *   node scripts/e2e-create-lawyer-http.js
 */
const http = require('http');
const mongoose = require('mongoose');
const { env } = require('../src/config/env');
const { buildContainer } = require('../src/shared/container');
const { createApp } = require('../src/app');
const { UserModel } = require('../src/modules/users/infrastructure/persistence/user.schema');
const { NotificationModel } = require('../src/modules/notifications/infrastructure/persistence/notification.schema');
const { AuditModel } = require('../src/modules/audit/infrastructure/persistence/audit.schema');

const PORT = 3998;
const BASE = `http://localhost:${PORT}/api`;
const STAMP = Date.now();
const ABG_CORREO = `e2e.http.abg.${STAMP}@example-test.hn`;

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log(`  ✓ ${m}`); } else { fail++; console.error(`  ✗ ${m}`); } };

// Captura el log de onboarding (que contiene la contraseña temporal cuando el SMTP no está configurado).
let onboardingLine = '';
const origLog = console.log;
console.log = (...a) => { const s = a.map(String).join(' '); if (s.includes('[onboarding]')) onboardingLine = s; origLog(...a); };

async function api(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null; try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

let capturedMail = null;
async function run() {
  await mongoose.connect(env.mongoUri);
  const container = buildContainer({ publish: () => {} });
  // Interceptamos el envío SOLO en la prueba: evita mandar correos reales a una
  // dirección de prueba y permite capturar la contraseña temporal generada.
  container.users.onboardUser.email = { send: async (m) => { capturedMail = m; return { ok: true }; } };
  const server = http.createServer(createApp(container));
  await new Promise((r) => server.listen(PORT, r));
  origLog(`[e2e-http] servidor de prueba en ${BASE}\n`);

  // 1) Login admin (seed: admin@legalcase.hn / demo1234)
  console.log('1) Login administrador');
  const login = await api('POST', '/auth/login', { correo: 'admin@legalcase.hn', contrasena: 'demo1234' });
  ok(login.status === 200 && !!login.data?.token, `admin autenticado (status ${login.status})`);
  const adminToken = login.data?.token;
  if (!adminToken) { origLog('  → no se pudo loguear admin (¿ejecutaste npm run seed?). Abortando.'); return finish(server); }

  // 2) Crear abogado SIN contraseña (exactamente como lo hace el frontend ahora)
  console.log('2) POST /users (alta de abogado) SIN campo contrasena');
  const create = await api('POST', '/users', {
    nombre: `Abg HTTP ${STAMP}`, correo: ABG_CORREO, telefono: '+504 3333-4444',
    especialidad: 'Derecho Civil', rol: 'abogado', activo: true,
  }, adminToken);
  ok(create.status === 201, `alta exitosa sin contraseña (status ${create.status})`);
  if (create.status !== 201) origLog('  → respuesta:', JSON.stringify(create.data));
  ok(!(create.data?.message || '').includes('contrasena'), `NO aparece "contrasena es requerido"`);
  ok(!create.data?.contrasena, 'la respuesta no expone la contraseña');

  // 3) Contraseña temporal generada y correo de credenciales emitido
  console.log('3) Credenciales generadas + correo de bienvenida');
  ok(!!capturedMail && capturedMail.to === ABG_CORREO, 'correo de bienvenida dirigido al abogado');
  const tempPwd = capturedMail?.text.match(/Contraseña temporal:\s*(\S+)/)?.[1];
  ok(!!tempPwd, `contraseña temporal generada por el sistema (${tempPwd || 'no capturada'})`);

  // 4) Login del abogado con las credenciales generadas
  console.log('4) Login del abogado con la contraseña temporal');
  const abgLogin = await api('POST', '/auth/login', { correo: ABG_CORREO, contrasena: tempPwd });
  ok(abgLogin.status === 200 && abgLogin.data?.user?.rol === 'abogado', `abogado inicia sesión (status ${abgLogin.status})`);

  await finish(server);
}

async function finish(server) {
  origLog('\n[e2e-http] limpiando…');
  const u = await UserModel.findOne({ correo: ABG_CORREO }).exec();
  if (u) {
    await NotificationModel.deleteMany({ destinatario: u.id });
    await AuditModel.deleteMany({ entidadId: u.id });
    await UserModel.deleteOne({ _id: u.id });
  }
  await new Promise((r) => server.close(r));
  await mongoose.disconnect();
  console.log = origLog;
  origLog(`\n[e2e-http] RESULTADO: ${pass} OK, ${fail} fallidas`);
  process.exit(fail === 0 ? 0 : 1);
}

run().catch(async (e) => { origLog('[e2e-http] ERROR:', e.stack || e.message); try { await mongoose.disconnect(); } catch {} process.exit(1); });
