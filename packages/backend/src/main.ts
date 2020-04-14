import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './util/redisIoAdapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: (15 * 60) / 2, // Allow 30 requests per minute in any 15 minute window
    }),
  );
  app.useWebSocketAdapter(new RedisIoAdapter(app));

  await app.listen(3001);
}
bootstrap();
