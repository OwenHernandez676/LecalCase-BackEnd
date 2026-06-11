/**
 * Smoke test sin base de datos: construye el contenedor real con un
 * RealtimePublisher nulo, levanta la app Express en un puerto efímero
 * y verifica health check, validación de DTOs y manejo de 404.
 */
const { buildContainer } = require('../src/shared/container');
const { createApp } = require('../src/app');
const { NoopRealtimePublisher } = require('../src/realtime/socketio-realtime.adapter');

async function request(port, method, path, body) {
  const res = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json() };
}

async function main() {
  const app = createApp(buildContainer(new NoopRealtimePublisher()));
  const server = app.listen(0);
  const { port } = server.address();

  const health = await request(port, 'GET', '/api/health');
  console.log('GET /api/health →', health.status, JSON.stringify(health.json));

  const badLogin = await request(port, 'POST', '/api/auth/login', { correo: 'no-es-correo', contrasena: '1' });
  console.log('POST /api/auth/login (inválido) →', badLogin.status, JSON.stringify(badLogin.json.message));

  const badRequest = await request(port, 'POST', '/api/requests', { cliente: 'X' });
  console.log('POST /api/requests (incompleto) →', badRequest.status, JSON.stringify(badRequest.json.message));

  const notFound = await request(port, 'GET', '/api/nada');
  console.log('GET /api/nada →', notFound.status, JSON.stringify(notFound.json.message));

  const noToken = await request(port, 'GET', '/api/cases');
  console.log('GET /api/cases (sin token) →', noToken.status, JSON.stringify(noToken.json.message));

  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  const ok = health.status === 200 && badLogin.status === 400 && badRequest.status === 400
    && notFound.status === 404 && noToken.status === 401;
  console.log(ok ? '[smoke] OK' : '[smoke] FALLÓ');
  process.exitCode = ok ? 0 : 1;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
