import * as dotenv from 'dotenv';
dotenv.config();

/** Configuración tipada del entorno. Punto único de lectura de process.env. */
export const env = {
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  mongoUri: process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017/legalcase',
  jwtSecret: process.env['JWT_SECRET'] ?? 'change-me',
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
  frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:4200',
} as const;
