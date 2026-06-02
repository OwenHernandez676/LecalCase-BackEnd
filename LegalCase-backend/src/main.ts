import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: false });
  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 3000;
  const frontendUrl = config.get<string>('frontendUrl') ?? '*';
  const uploadsDir = process.env['UPLOADS_DIR'] ?? 'uploads';

  app.setGlobalPrefix('api');
  app.enableCors({ origin: [frontendUrl, 'http://localhost:4200'], credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  // Servir archivos subidos en /uploads (fuera del prefijo /api).
  app.useStaticAssets(join(process.cwd(), uploadsDir), { prefix: '/uploads/' });

  await app.listen(port);
  Logger.log(`LEXVANTE API listening on http://localhost:${port}/api`, 'Bootstrap');
}
bootstrap();
