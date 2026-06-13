/**
 * E2E del tablero Kanban de tareas (CRUD + aislamiento). Limpia al final.
 *   node scripts/e2e-tasks.js
 */
const mongoose = require('mongoose');
const { env } = require('../src/config/env');
const { buildContainer } = require('../src/shared/container');
const { CaseModel } = require('../src/modules/cases/infrastructure/persistence/case.schema');
const { TaskModel } = require('../src/modules/tasks/infrastructure/persistence/task.schema');
const { NotificationModel } = require('../src/modules/notifications/infrastructure/persistence/notification.schema');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log(`  ✓ ${m}`); } else { fail++; console.error(`  ✗ ${m}`); } };

async function run() {
  await mongoose.connect(env.mongoUri);
  const c = buildContainer({ publish: () => {} });

  const STAMP = Date.now();
  const abogadoId = new mongoose.Types.ObjectId().toString();
  const otroAbg = new mongoose.Types.ObjectId().toString();
  const clienteId = new mongoose.Types.ObjectId().toString();
  const ctxAbg = { sub: abogadoId, rol: 'abogado' };
  const ctxOtro = { sub: otroAbg, rol: 'abogado' };
  const ctxCli = { sub: clienteId, rol: 'cliente' };

  const exp = await CaseModel.create({
    codigo: `EXP-T${STAMP}`, titulo: 'Caso de prueba Kanban', tipo: 'Civil',
    cliente: 'Cliente Tareas', clienteId, abogado: 'Abg Tareas', abogadoId,
    estado: 'En proceso', prioridad: 'Media', fechaVencimiento: new Date(),
  });
  console.log(`[e2e-tasks] expediente de prueba ${exp.codigo}\n`);

  // 1) Crear tareas (abogado dueño)
  console.log('1) Crear tareas');
  const t1 = await c.tasks.createTask.execute({ titulo: 'Redactar demanda', prioridad: 'Alta', expedienteId: exp.id }, ctxAbg);
  const t2 = await c.tasks.createTask.execute({ titulo: 'Reunir pruebas', expedienteId: exp.id }, ctxAbg);
  ok(!!t1.id && t1.abogadoId === abogadoId && t1.estado === 'Pendiente', 'tarea creada (responsable=abogado, estado inicial Pendiente)');
  ok(!!t2.id, 'segunda tarea creada');

  // 2) Otro abogado NO puede crear en este expediente
  console.log('2) Permisos de creación');
  let blocked = false;
  try { await c.tasks.createTask.execute({ titulo: 'Intruso', expedienteId: exp.id }, ctxOtro); } catch { blocked = true; }
  ok(blocked, 'otro abogado NO puede crear tareas en un expediente ajeno');

  // 3) Listado con aislamiento
  console.log('3) Listado por rol');
  ok((await c.tasks.listTasks.execute(undefined, ctxAbg)).length === 2, 'abogado ve sus 2 tareas');
  ok((await c.tasks.listTasks.execute(undefined, ctxOtro)).length === 0, 'otro abogado ve 0 tareas');
  ok((await c.tasks.listTasks.execute(undefined, ctxCli)).length === 2, 'cliente ve (lectura) las tareas de su expediente');
  ok((await c.tasks.listTasks.execute(exp.id, ctxCli)).length === 2, 'cliente lista por expediente propio');

  // 4) Mover tarea entre columnas (update estado)
  console.log('4) Mover entre columnas');
  const moved = await c.tasks.updateTask.execute(t1.id, { estado: 'En proceso' }, ctxAbg);
  ok(moved.estado === 'En proceso', 'tarea movida a "En proceso"');
  const edited = await c.tasks.updateTask.execute(t1.id, { titulo: 'Redactar y presentar demanda', prioridad: 'Crítica' }, ctxAbg);
  ok(edited.titulo === 'Redactar y presentar demanda' && edited.prioridad === 'Crítica', 'tarea editada');

  // 5) Otro abogado NO puede modificar/eliminar
  console.log('5) Permisos de edición/borrado');
  let upBlocked = false, delBlocked = false;
  try { await c.tasks.updateTask.execute(t1.id, { estado: 'Finalizado' }, ctxOtro); } catch { upBlocked = true; }
  try { await c.tasks.deleteTask.execute(t1.id, ctxOtro); } catch { delBlocked = true; }
  ok(upBlocked, 'otro abogado NO puede modificar la tarea');
  ok(delBlocked, 'otro abogado NO puede eliminar la tarea');

  // 6) Eliminar (dueño)
  console.log('6) Eliminar');
  await c.tasks.deleteTask.execute(t2.id, ctxAbg);
  ok((await c.tasks.listTasks.execute(undefined, ctxAbg)).length === 1, 'tras eliminar, queda 1 tarea');

  // Limpieza
  console.log('\n[e2e-tasks] limpiando…');
  await Promise.all([
    TaskModel.deleteMany({ expedienteId: exp.id }),
    CaseModel.deleteOne({ _id: exp.id }),
    NotificationModel.deleteMany({ destinatario: clienteId }),
  ]);

  await mongoose.disconnect();
  console.log(`\n[e2e-tasks] RESULTADO: ${pass} OK, ${fail} fallidas`);
  process.exit(fail === 0 ? 0 : 1);
}

run().catch(async (e) => { console.error('[e2e-tasks] ERROR:', e.stack || e.message); try { await mongoose.disconnect(); } catch {} process.exit(1); });
