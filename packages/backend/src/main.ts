import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { RedisSocketIoAdapter } from './util/redisSocketIoAdapter';

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
  app.useWebSocketAdapter(new RedisSocketIoAdapter(app));

  await app.listen(3001);
}
bootstrap();
