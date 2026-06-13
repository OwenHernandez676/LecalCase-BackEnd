/**
 * Prueba E2E de los flujos críticos (NO deja datos permanentes: limpia al final).
 * Ejercita los casos de uso reales contra la base de datos configurada en .env:
 *   - Alta de abogado (onboarding + correo + login)
 *   - Solicitud → aprobación → cliente + expediente + actividad + notificación + auditoría
 *   - Login del cliente
 *   - Aislamiento de datos: cliente y abogado solo ven lo suyo
 *   - Mensajería: acceso permitido al propio expediente y bloqueado al ajeno
 *
 *   node scripts/e2e-approval-flow.js
 */
const mongoose = require('mongoose');
const { env } = require('../src/config/env');
const { buildContainer } = require('../src/shared/container');

const { RequestModel } = require('../src/modules/requests/infrastructure/persistence/request.schema');
const { UserModel } = require('../src/modules/users/infrastructure/persistence/user.schema');
const { CaseModel } = require('../src/modules/cases/infrastructure/persistence/case.schema');
const { ActivityModel } = require('../src/modules/activities/infrastructure/persistence/activity.schema');
const { NotificationModel } = require('../src/modules/notifications/infrastructure/persistence/notification.schema');
const { AuditModel } = require('../src/modules/audit/infrastructure/persistence/audit.schema');
const { MessageModel } = require('../src/modules/messages/infrastructure/persistence/message.schema');

const STAMP = Date.now();
const CLIENTE_CORREO = `e2e.cliente.${STAMP}@example-test.hn`;
const CLIENTE_NOMBRE = `Cliente E2E ${STAMP}`;
const ABOGADO_CORREO = `e2e.abogado.${STAMP}@example-test.hn`;

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log(`  ✓ ${m}`); } else { fail++; console.error(`  ✗ ${m}`); } };
const cleanupIds = { reqs: [], cases: [], users: [], acts: [], notifsUsers: [], audits: [], msgs: [] };

async function run() {
  await mongoose.connect(env.mongoUri);
  console.log('[e2e] conectado a MongoDB\n');
  const c = buildContainer({ publish: () => {} });

  // Captura de correos salientes (sustituye el sender real en cada caso de uso).
  let mailLawyer = null, mailClient = null;
  c.users.onboardUser.email = { send: async (m) => { mailLawyer = m; return { ok: true }; } };
  c.requests.resolveRequest.email = { send: async (m) => { mailClient = m; return { ok: true }; } };

  // ── 1. Alta de abogado (onboarding) ──
  console.log('1) Alta de abogado con correo y credenciales');
  const abogado = await c.users.onboardUser.execute({
    nombre: `Abg E2E ${STAMP}`, correo: ABOGADO_CORREO, telefono: '+504 1111-2222',
    especialidad: 'Civil', rol: 'abogado', activo: true,
  }, 'admin@legalcase.hn');
  cleanupIds.users.push(abogado.id); cleanupIds.notifsUsers.push(abogado.id);
  ok(abogado.rol === 'abogado', 'abogado creado con rol abogado');
  ok(!!mailLawyer && /Lex-/.test(mailLawyer.text), 'correo de bienvenida del abogado con contraseña temporal');
  const abgPwd = mailLawyer.text.match(/Contraseña temporal:\s*(\S+)/)?.[1];
  const abgSession = await c.auth.login.execute({ correo: ABOGADO_CORREO, contrasena: abgPwd });
  ok(!!abgSession.token && abgSession.user.rol === 'abogado', 'abogado puede iniciar sesión');

  // ── 2. Solicitud + aprobación asignando ESE abogado ──
  console.log('2) Solicitud → aprobación (asignando al abogado)');
  const req = await c.requests.createRequest.execute({
    cliente: CLIENTE_NOMBRE, correo: CLIENTE_CORREO, telefono: '+504 0000-0000',
    tipo: 'Civil', prioridad: 'Media', descripcion: 'Solicitud E2E automatizada para validar el flujo completo.',
  });
  cleanupIds.reqs.push(req.id); cleanupIds.audits.push(req.id);
  const updated = await c.requests.resolveRequest.execute(req.id, {
    estado: 'Aprobada', abogado: abogado.nombre, abogadoId: abogado.id,
    prioridad: 'Alta', observaciones: 'Atender con prioridad.', actor: 'admin@legalcase.hn',
  });
  ok(updated.estado === 'Aprobada' && !!updated.expedienteId && !!updated.clienteUserId, 'solicitud aprobada y enlazada');
  cleanupIds.cases.push(updated.expedienteId); cleanupIds.acts.push(updated.expedienteId);

  // ── 3. Cliente creado + correo + login ──
  console.log('3) Cliente creado con credenciales y login');
  const cliente = await UserModel.findOne({ correo: CLIENTE_CORREO }).select('+contrasena').exec();
  cleanupIds.users.push(cliente.id); cleanupIds.notifsUsers.push(cliente.id);
  ok(!!cliente && cliente.rol === 'cliente', 'usuario cliente creado');
  ok(cliente.contrasena.startsWith('$2'), 'contraseña del cliente hasheada (bcrypt)');
  const cliPwd = mailClient.text.match(/Contraseña temporal:\s*(\S+)/)?.[1];
  const cliSession = await c.auth.login.execute({ correo: CLIENTE_CORREO, contrasena: cliPwd });
  ok(!!cliSession.token && cliSession.user.rol === 'cliente', 'cliente puede iniciar sesión');

  // ── 4. Expediente + actividad + notificaciones + auditoría ──
  console.log('4) Expediente, actividad, notificaciones y auditoría');
  const exp = await CaseModel.findById(updated.expedienteId).exec();
  ok(exp.clienteId === cliente.id, 'expediente.clienteId === cliente');
  ok(exp.abogadoId === abogado.id, 'expediente.abogadoId === abogado');
  ok(exp.prioridad === 'Alta', 'prioridad elegida aplicada');
  const acts = await ActivityModel.find({ expedienteId: exp.id }).exec();
  ok(acts.some((a) => a.tipo === 'creacion' && /Observaciones/.test(a.descripcion)), 'actividad de creación con observaciones');
  const notifCli = await NotificationModel.find({ destinatario: cliente.id }).exec();
  const notifAbg = await NotificationModel.find({ destinatario: abogado.id }).exec();
  ok(notifCli.length > 0, 'notificación para el cliente');
  ok(notifAbg.some((n) => /asign/i.test(n.mensaje)), 'notificación de asignación para el abogado');
  ok((await AuditModel.find({ entidadId: req.id, accion: 'solicitud.aprobada' }).exec()).length > 0, 'auditoría de aprobación');
  ok((await AuditModel.find({ accion: 'usuario.creado', entidadId: abogado.id }).exec()).length > 0, 'auditoría de alta de abogado');

  // ── 5. Aislamiento de datos ──
  console.log('5) Aislamiento por rol');
  const ctxCli = { sub: cliente.id, rol: 'cliente', correo: CLIENTE_CORREO };
  const ctxAbg = { sub: abogado.id, rol: 'abogado', correo: ABOGADO_CORREO };
  const casosCli = await c.cases.listCases.execute({}, ctxCli);
  ok(casosCli.length === 1 && casosCli[0].id === exp.id, `cliente ve solo su expediente (${casosCli.length})`);
  const casosAbg = await c.cases.listCases.execute({}, ctxAbg);
  ok(casosAbg.length === 1 && casosAbg[0].id === exp.id, `abogado ve solo su expediente asignado (${casosAbg.length})`);
  const casosAdmin = await c.cases.listCases.execute({}, { rol: 'administrador' });
  ok(casosAdmin.length > 1, `administrador ve todos (${casosAdmin.length})`);

  // ── 6. Mensajería con permisos ──
  console.log('6) Mensajería aislada por expediente');
  const msg = await c.messages.sendMsg.execute(
    { expedienteId: exp.id, emisor: CLIENTE_NOMBRE, receptor: abogado.nombre, texto: 'Hola, ¿novedades de mi caso?' }, ctxCli);
  cleanupIds.msgs.push(exp.id);
  ok(!!msg.id, 'cliente envía mensaje en su expediente');
  const hist = await c.messages.listMsgs.execute(exp.id, ctxCli);
  ok(hist.length === 1, 'historial del expediente devuelve el mensaje');
  let blocked = false;
  try {
    await c.messages.listMsgs.execute(String(new mongoose.Types.ObjectId()), ctxCli);
  } catch { blocked = true; }
  ok(blocked, 'cliente NO accede a la conversación de un expediente ajeno');

  // ── Limpieza ──
  console.log('\n[e2e] limpiando datos de prueba…');
  await Promise.all([
    RequestModel.deleteMany({ _id: { $in: cleanupIds.reqs } }),
    CaseModel.deleteMany({ _id: { $in: cleanupIds.cases } }),
    UserModel.deleteMany({ _id: { $in: cleanupIds.users } }),
    ActivityModel.deleteMany({ expedienteId: { $in: cleanupIds.acts } }),
    NotificationModel.deleteMany({ destinatario: { $in: cleanupIds.notifsUsers } }),
    AuditModel.deleteMany({ entidadId: { $in: [...cleanupIds.audits, ...cleanupIds.users] } }),
    MessageModel.deleteMany({ expedienteId: { $in: cleanupIds.msgs } }),
  ]);

  await mongoose.disconnect();
  console.log(`\n[e2e] RESULTADO: ${pass} OK, ${fail} fallidas`);
  process.exit(fail === 0 ? 0 : 1);
}

run().catch(async (err) => {
  console.error('\n[e2e] ERROR:', err.stack || err.message);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
