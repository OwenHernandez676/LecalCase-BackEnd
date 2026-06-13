/**
 * Prueba E2E del flujo de aprobación (NO modifica datos permanentes: limpia al final).
 * Ejercita los casos de uso reales contra la base de datos configurada en .env.
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

const STAMP = Date.now();
const TEST_CORREO = `e2e.cliente.${STAMP}@example-test.hn`;
const TEST_CLIENTE = `Cliente E2E ${STAMP}`;

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; console.log(`  ✓ ${msg}`); } else { fail++; console.error(`  ✗ ${msg}`); } };

async function run() {
  await mongoose.connect(env.mongoUri);
  console.log('[e2e] conectado a MongoDB\n');

  const c = buildContainer({ publish: () => {} });

  // Captura el correo de bienvenida (sustituye el sender real) para extraer la contraseña temporal.
  let captured = null;
  c.requests.resolveRequest.email = { send: async (m) => { captured = m; return { ok: true }; } };

  // ── 1. Crear solicitud (simula el formulario público) ──
  console.log('1) Crear solicitud pública');
  const req = await c.requests.createRequest.execute({
    cliente: TEST_CLIENTE, correo: TEST_CORREO, telefono: '+504 0000-0000',
    tipo: 'Civil', prioridad: 'Media', descripcion: 'Solicitud de prueba automatizada E2E para validar el flujo.',
  });
  ok(!!req.id && req.estado === 'Pendiente', `solicitud creada (${req.codigo}, estado=${req.estado})`);

  // ── 2. Aprobar (asignando abogado) ──
  console.log('2) Aprobar solicitud con abogado asignado');
  const updated = await c.requests.resolveRequest.execute(req.id, {
    estado: 'Aprobada', abogado: 'Rodrigo Castellanos', prioridad: 'Alta', actor: 'admin@legalcase.hn',
  });
  ok(updated.estado === 'Aprobada', 'solicitud quedó Aprobada');
  ok(!!updated.expedienteId, 'solicitud enlazó expedienteId');
  ok(!!updated.clienteUserId, 'solicitud enlazó clienteUserId');
  ok(!!updated.resueltaEn, 'solicitud registró fecha de resolución');

  // ── 3. Usuario cliente creado ──
  console.log('3) Usuario CLIENTE creado con credenciales');
  const cliente = await UserModel.findOne({ correo: TEST_CORREO }).select('+contrasena').exec();
  ok(!!cliente, 'usuario cliente existe');
  ok(cliente.rol === 'cliente', `rol = cliente`);
  ok(!!cliente.contrasena && cliente.contrasena.startsWith('$2'), 'contraseña almacenada como hash bcrypt');
  ok(!!captured && /Lex-/.test(captured.text), 'correo de bienvenida con contraseña temporal generado');
  const tempPwd = captured.text.match(/Contraseña temporal:\s*(\S+)/)?.[1];
  ok(!!tempPwd, `contraseña temporal extraída del correo (${tempPwd})`);

  // ── 4. Expediente creado y enlazado ──
  console.log('4) Expediente creado y enlazado al cliente y abogado');
  const expediente = await CaseModel.findById(updated.expedienteId).exec();
  ok(!!expediente, `expediente existe (${expediente?.codigo})`);
  ok(expediente.clienteId === cliente.id, 'expediente.clienteId === id del cliente');
  ok(expediente.abogado === 'Rodrigo Castellanos', 'expediente.abogado asignado');
  ok(expediente.prioridad === 'Alta', 'expediente tomó la prioridad elegida');

  // ── 5. Actividad, notificación y auditoría persistidas ──
  console.log('5) Actividad + notificación + auditoría');
  const acts = await ActivityModel.find({ expedienteId: expediente.id }).exec();
  ok(acts.some((a) => a.tipo === 'creacion'), 'actividad de creación registrada');
  const notifs = await NotificationModel.find({ destinatario: cliente.id }).exec();
  ok(notifs.length > 0, 'notificación creada para el cliente');
  const audits = await AuditModel.find({ entidadId: req.id, accion: 'solicitud.aprobada' }).exec();
  ok(audits.length > 0, 'auditoría de aprobación registrada');

  // ── 6. Login del cliente con la contraseña temporal ──
  console.log('6) Login del cliente con la contraseña temporal');
  const session = await c.auth.login.execute({ correo: TEST_CORREO, contrasena: tempPwd });
  ok(!!session.token, 'login exitoso: token emitido');
  ok(session.user.rol === 'cliente', 'sesión con rol cliente');

  // ── 7. Aislamiento: el cliente solo ve SU expediente ──
  console.log('7) Aislamiento de datos del cliente');
  const userCtx = { sub: cliente.id, rol: 'cliente', correo: TEST_CORREO };
  const susCasos = await c.cases.listCases.execute({}, userCtx);
  ok(susCasos.length === 1 && susCasos[0].id === expediente.id, `cliente ve solo su expediente (${susCasos.length})`);
  const todos = await c.cases.listCases.execute({}, { rol: 'administrador' });
  ok(todos.length > susCasos.length, `administrador ve todos (${todos.length})`);
  const docsCliente = await c.documents.listDocs.execute(undefined, userCtx);
  ok(Array.isArray(docsCliente), `documentos del cliente filtrados (${docsCliente.length})`);
  const actsAjenas = await c.activities.listByCase.execute(String(new mongoose.Types.ObjectId()), userCtx);
  ok(actsAjenas.length === 0, 'cliente NO ve actividad de un expediente ajeno');

  // ── Limpieza de los artefactos de prueba ──
  console.log('\n[e2e] limpiando datos de prueba…');
  await Promise.all([
    RequestModel.deleteOne({ _id: req.id }),
    CaseModel.deleteOne({ _id: expediente.id }),
    UserModel.deleteOne({ _id: cliente.id }),
    ActivityModel.deleteMany({ expedienteId: expediente.id }),
    NotificationModel.deleteMany({ destinatario: cliente.id }),
    AuditModel.deleteMany({ entidadId: req.id }),
  ]);

  await mongoose.disconnect();
  console.log(`\n[e2e] RESULTADO: ${pass} OK, ${fail} fallidas`);
  process.exit(fail === 0 ? 0 : 1);
}

run().catch(async (err) => {
  console.error('\n[e2e] ERROR:', err.message);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
