import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  // Bật CORS (Phải đặt TRƯỚC app.listen)
  app.enableCors({
    origin: 'http://localhost:3000', // Cho phép Next.js gọi sang
    credentials: true,
  });

  // Bật Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Khởi chạy Server
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

// FIX: Thêm .catch() để xử lý lỗi khởi động và thỏa mãn luật no-floating-promises
void bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
});
