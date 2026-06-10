import 'reflect-metadata';
import http from 'http';
import mongoose from 'mongoose';
import { env } from './config/env';
import { buildContainer } from './shared/container';
import { createApp } from './app';
import { SocketIORealtimeAdapter } from './realtime/socketio-realtime.adapter';

/**
 * Bootstrap de LegalCase Backend (MEAN: MongoDB Atlas + Express + Angular + Node).
 * 1. Conecta a MongoDB (Atlas o local según MONGODB_URI).
 * 2. Crea el servidor HTTP y monta Socket.IO sobre él.
 * 3. Construye el contenedor (composition root) y la app Express.
 */
async function bootstrap(): Promise<void> {
  await mongoose.connect(env.mongoUri);
  console.log(`[mongo] conectado a ${env.mongoUri.replace(/\/\/.*@/, '//***@')}`);

  const server = http.createServer();
  const realtime = new SocketIORealtimeAdapter(server, env.frontendUrl);
  const container = buildContainer(realtime);
  const app = createApp(container);

  // Express atiende las requests del mismo servidor HTTP que comparte con Socket.IO
  server.on('request', app);

  server.listen(env.port, () => {
    console.log(`[http] LegalCase API escuchando en http://localhost:${env.port}/api`);
    console.log(`[ws]   Socket.IO en ws://localhost:${env.port}/realtime`);
  });
}

bootstrap().catch((err) => {
  console.error('Error fatal durante el arranque:', err);
  process.exit(1);
});
