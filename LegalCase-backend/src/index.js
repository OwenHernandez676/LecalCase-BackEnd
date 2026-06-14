const http = require('http');
const mongoose = require('mongoose');
const { env } = require('./config/env');
const { buildContainer } = require('./shared/container');
const { createApp } = require('./app');
const { SocketIORealtimeAdapter } = require('./realtime/socketio-realtime.adapter');
const { JwtTokenSigner } = require('./modules/auth/infrastructure/services/jwt-token-signer');

/**
 * Bootstrap de LegalCase Backend (MEAN: MongoDB Atlas + Express + Angular + Node).
 * 1. Conecta a MongoDB (Atlas o local según MONGODB_URI).
 * 2. Crea el servidor HTTP y monta Socket.IO sobre él.
 * 3. Construye el contenedor (composition root) y la app Express.
 */
async function bootstrap() {
  await mongoose.connect(env.mongoUri);
  console.log(`[mongo] conectado a ${env.mongoUri.replace(/\/\/.*@/, '//***@')}`);

  const server = http.createServer();
  // Socket.IO verifica el mismo JWT de la API para autenticar cada conexión.
  const socketTokens = new JwtTokenSigner(env.jwtSecret, env.jwtExpiresIn);
  const realtime = new SocketIORealtimeAdapter(server, env.frontendUrl, socketTokens);
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
