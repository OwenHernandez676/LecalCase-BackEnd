/**
 * Script de seed: pobla MongoDB con datos de demo para arrancar el sistema.
 *   npm run seed
 */
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppModule } from '../app.module';
import { UserModel } from '../modules/users/infrastructure/persistence/user.schema';
import { CaseModel } from '../modules/cases/infrastructure/persistence/case.schema';
import { RequestModel } from '../modules/requests/infrastructure/persistence/request.schema';
import { ActivityModel } from '../modules/activities/infrastructure/persistence/activity.schema';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const log = new Logger('Seed');

  const users = app.get<Model<UserModel>>(getModelToken(UserModel.name));
  const cases = app.get<Model<CaseModel>>(getModelToken(CaseModel.name));
  const requests = app.get<Model<RequestModel>>(getModelToken(RequestModel.name));
  const activities = app.get<Model<ActivityModel>>(getModelToken(ActivityModel.name));

  log.log('Limpiando colecciones…');
  await Promise.all([users.deleteMany({}), cases.deleteMany({}), requests.deleteMany({}), activities.deleteMany({})]);

  const pwd = await bcrypt.hash('demo1234', 10);
  log.log('Creando usuarios…');
  const createdUsers = await users.insertMany([
    { nombre: 'Mariela Fonseca', correo: 'admin@lexvante.hn', contrasena: pwd, rol: 'administrador', activo: true },
    { nombre: 'Rodrigo Castellanos', correo: 'abogado@lexvante.hn', contrasena: pwd, rol: 'abogado', especialidad: 'Laboral', cargaTrabajo: 72, activo: true },
    { nombre: 'Lucía Bográn', correo: 'lucia@lexvante.hn', contrasena: pwd, rol: 'abogado', especialidad: 'Civil', cargaTrabajo: 54, activo: true },
    { nombre: 'Diego Maradiaga', correo: 'diego@lexvante.hn', contrasena: pwd, rol: 'abogado', especialidad: 'Penal', cargaTrabajo: 88, activo: true },
    { nombre: 'Carlos Mendoza', correo: 'cliente@lexvante.hn', contrasena: pwd, rol: 'cliente', activo: true },
  ]);
  log.log(`  ${createdUsers.length} usuarios creados`);

  log.log('Creando expedientes…');
  const createdCases = await cases.insertMany([
    { codigo: 'EXP-2048', titulo: 'Constitución de sociedad — Grupo Andares', tipo: 'Mercantil', cliente: 'Grupo Andares S.A.', abogado: 'Mariela Fonseca', estado: 'En proceso', prioridad: 'Alta', progreso: 45, fechaApertura: new Date('2026-02-06'), fechaVencimiento: new Date('2026-06-30') },
    { codigo: 'EXP-2047', titulo: 'Demanda laboral por despido injustificado', tipo: 'Laboral', cliente: 'Carlos Mendoza', abogado: 'Rodrigo Castellanos', estado: 'En revisión', prioridad: 'Crítica', progreso: 68, fechaApertura: new Date('2026-02-04'), fechaVencimiento: new Date('2026-06-12') },
    { codigo: 'EXP-2046', titulo: 'Incumplimiento de contrato de suministro', tipo: 'Civil', cliente: 'Industrias Lempira', abogado: 'Diego Maradiaga', estado: 'En proceso', prioridad: 'Media', progreso: 32, fechaApertura: new Date('2026-01-28'), fechaVencimiento: new Date('2026-07-20') },
    { codigo: 'EXP-2045', titulo: 'Divorcio por mutuo consentimiento', tipo: 'Familia', cliente: 'Familia Discua', abogado: 'Lucía Bográn', estado: 'Finalizado', prioridad: 'Baja', progreso: 100, fechaApertura: new Date('2026-01-12'), fechaVencimiento: new Date('2026-05-05') },
  ]);
  log.log(`  ${createdCases.length} expedientes creados`);

  log.log('Creando solicitudes…');
  await requests.insertMany([
    { codigo: 'SOL-148', cliente: 'Grupo Andares S.A.', correo: 'legal@andares.hn', telefono: '+504 2234-5678', tipo: 'Mercantil', prioridad: 'Alta', descripcion: 'Constitución de sociedad y registro de marca.', estado: 'Pendiente' },
    { codigo: 'SOL-147', cliente: 'Ana Lucía Reyes', correo: 'a.reyes@gmail.com', telefono: '+504 9988-1122', tipo: 'Laboral', prioridad: 'Crítica', descripcion: 'Despido injustificado: reinstalación y prestaciones.', estado: 'Pendiente' },
    { codigo: 'SOL-146', cliente: 'Industrias Lempira', correo: 'contacto@lempira.hn', telefono: '+504 2200-3344', tipo: 'Civil', prioridad: 'Media', descripcion: 'Incumplimiento de contrato de suministro.', estado: 'Pendiente' },
  ]);
  log.log('  3 solicitudes creadas');

  log.log('Creando actividades…');
  await activities.insertMany([
    { expedienteId: createdCases[0].id, tipo: 'creacion', descripcion: 'Expediente creado', autor: 'Mariela Fonseca' },
    { expedienteId: createdCases[1].id, tipo: 'estado', descripcion: 'Estado actualizado a En revisión', autor: 'Rodrigo Castellanos' },
  ]);

  log.log('Seed completado.');
  log.log('  → admin@lexvante.hn / abogado@lexvante.hn / cliente@lexvante.hn');
  log.log('  → contraseña: demo1234');
  await app.close();
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
