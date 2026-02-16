import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set FAL_KEY in process.env if not picked up by .env file yet (Nest ConfigService handles logic but library reads process.env)
  // But ConfigService loads .env to process.env usually.

  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'], // Allow frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true, // Allow cookies
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
