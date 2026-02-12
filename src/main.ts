import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔐 Global DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 🌍 CORS (keep this if you plan a frontend)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 🚀 Required for Render
  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
