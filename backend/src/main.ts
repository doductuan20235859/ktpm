import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common'; // 1. Nhớ import cái này

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  // 2. Bật CORS (Phải đặt TRƯỚC app.listen)
  app.enableCors({
    origin: 'http://localhost:3000', // Cho phép Next.js gọi sang
    credentials: true,
  });

  // 3. Bật Validation (Để các @IsNotEmpty trong DTO hoạt động)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các field thừa không có trong DTO (Bảo mật)
      forbidNonWhitelisted: true, // Báo lỗi nếu gửi field thừa
    }),
  );

  // 4. Khởi chạy Server (Luôn đặt CUỐI CÙNG)
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
