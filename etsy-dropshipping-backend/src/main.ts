import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Set FAL_KEY in process.env if not picked up by .env file yet (Nest ConfigService handles logic but library reads process.env)
  // But ConfigService loads .env to process.env usually.

  app.use(cookieParser());
  app.enableCors({
    origin: true, // Echo origin (required for credentials)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true, // Allow cookies
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
