export const configuration = () => ({
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  mongoUri: process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017/lexvante',
  jwt: {
    secret: process.env['JWT_SECRET'] ?? 'change-me',
    expiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
  },
  frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:4200',
});
