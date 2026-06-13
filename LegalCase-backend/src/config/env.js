const dotenv = require('dotenv');
dotenv.config();

/** Configuración del entorno. Punto único de lectura de process.env. */
const env = Object.freeze({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/legalcase',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:4200',

  /**
   * SMTP para el correo de bienvenida al cliente aprobado.
   * Con Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, SMTP_SECURE=true,
   * SMTP_USER=tu_correo@gmail.com, SMTP_PASS=<App Password de 16 dígitos>.
   * Si no se configura, el envío se omite (no rompe la aprobación) y se avisa por consola.
   */
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: parseInt(process.env.SMTP_PORT ?? '465', 10),
    secure: (process.env.SMTP_SECURE ?? 'true') === 'true',
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.MAIL_FROM ?? 'LegalCase <no-reply@legalcase.hn>',
  },
});

module.exports = { env };
