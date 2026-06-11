/**
 * Script de seed: pobla MongoDB (Atlas o local) con datos de demo.
 *   npm run seed
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { env } = require('../config/env');
const { UserModel } = require('../modules/users/infrastructure/persistence/user.schema');
const { CaseModel } = require('../modules/cases/infrastructure/persistence/case.schema');
const { RequestModel } = require('../modules/requests/infrastructure/persistence/request.schema');
const { ActivityModel } = require('../modules/activities/infrastructure/persistence/activity.schema');

async function seed() {
  await mongoose.connect(env.mongoUri);
  console.log('[seed] conectado a MongoDB');

  console.log('[seed] limpiando colecciones…');
  await Promise.all([
    UserModel.deleteMany({}), CaseModel.deleteMany({}),
    RequestModel.deleteMany({}), ActivityModel.deleteMany({}),
  ]);

  const pwd = await bcrypt.hash('demo1234', 10);

  console.log('[seed] creando usuarios…');
  await UserModel.insertMany([
    { nombre: 'Mariela Fonseca', correo: 'admin@legalcase.hn', contrasena: pwd, rol: 'administrador', activo: true },
    { nombre: 'Rodrigo Castellanos', correo: 'abogado@legalcase.hn', contrasena: pwd, rol: 'abogado', especialidad: 'Laboral', cargaTrabajo: 72, activo: true },
    { nombre: 'Lucía Bográn', correo: 'lucia@legalcase.hn', contrasena: pwd, rol: 'abogado', especialidad: 'Civil', cargaTrabajo: 54, activo: true },
    { nombre: 'Diego Maradiaga', correo: 'diego@legalcase.hn', contrasena: pwd, rol: 'abogado', especialidad: 'Penal', cargaTrabajo: 88, activo: true },
    { nombre: 'Carlos Mendoza', correo: 'cliente@legalcase.hn', contrasena: pwd, rol: 'cliente', activo: true },
  ]);

  console.log('[seed] creando expedientes…');
  const cases = await CaseModel.insertMany([
    { codigo: 'EXP-2048', titulo: 'Constitución de sociedad — Grupo Andares', tipo: 'Mercantil', cliente: 'Grupo Andares S.A.', abogado: 'Mariela Fonseca', estado: 'En proceso', prioridad: 'Alta', progreso: 45, fechaApertura: new Date('2026-02-06'), fechaVencimiento: new Date('2026-06-30') },
    { codigo: 'EXP-2047', titulo: 'Demanda laboral por despido injustificado', tipo: 'Laboral', cliente: 'Carlos Mendoza', abogado: 'Rodrigo Castellanos', estado: 'En revisión', prioridad: 'Crítica', progreso: 68, fechaApertura: new Date('2026-02-04'), fechaVencimiento: new Date('2026-06-12') },
    { codigo: 'EXP-2046', titulo: 'Incumplimiento de contrato de suministro', tipo: 'Civil', cliente: 'Industrias Lempira', abogado: 'Diego Maradiaga', estado: 'En proceso', prioridad: 'Media', progreso: 32, fechaApertura: new Date('2026-01-28'), fechaVencimiento: new Date('2026-07-20') },
    { codigo: 'EXP-2045', titulo: 'Divorcio por mutuo consentimiento', tipo: 'Familia', cliente: 'Familia Discua', abogado: 'Lucía Bográn', estado: 'Finalizado', prioridad: 'Baja', progreso: 100, fechaApertura: new Date('2026-01-12'), fechaVencimiento: new Date('2026-05-05') },
  ]);

  console.log('[seed] creando solicitudes…');
  await RequestModel.insertMany([
    { codigo: 'SOL-148', cliente: 'Grupo Andares S.A.', correo: 'legal@andares.hn', telefono: '+504 2234-5678', tipo: 'Mercantil', prioridad: 'Alta', descripcion: 'Constitución de sociedad y registro de marca.', estado: 'Pendiente' },
    { codigo: 'SOL-147', cliente: 'Ana Lucía Reyes', correo: 'a.reyes@gmail.com', telefono: '+504 9988-1122', tipo: 'Laboral', prioridad: 'Crítica', descripcion: 'Despido injustificado: reinstalación y prestaciones.', estado: 'Pendiente' },
    { codigo: 'SOL-146', cliente: 'Industrias Lempira', correo: 'contacto@lempira.hn', telefono: '+504 2200-3344', tipo: 'Civil', prioridad: 'Media', descripcion: 'Incumplimiento de contrato de suministro.', estado: 'Pendiente' },
  ]);

  console.log('[seed] creando actividades…');
  await ActivityModel.insertMany([
    { expedienteId: cases[0].id, tipo: 'creacion', descripcion: 'Expediente creado', autor: 'Mariela Fonseca' },
    { expedienteId: cases[1].id, tipo: 'estado', descripcion: 'Estado actualizado a En revisión', autor: 'Rodrigo Castellanos' },
  ]);

  console.log('[seed] completado.');
  console.log('  → admin@legalcase.hn / abogado@legalcase.hn / cliente@legalcase.hn');
  console.log('  → contraseña: demo1234');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
