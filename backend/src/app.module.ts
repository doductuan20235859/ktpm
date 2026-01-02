import { Module, OnModuleInit } from '@nestjs/common'; // 1. Thêm OnModuleInit
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm'; // 2. Thêm DataSource
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Product } from './product.entity'; // Import file vừa tạo
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ApartmentsModule } from './apartments/apartments.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { RequestsModule } from './requests/requests.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AmenitiesModule } from './amenities/amenities.module';
import { NotificationsModule } from './notifications/notifications.module';
import { InvoiceItemsModule } from './invoice_items/invoice_items.module';
import { ServeStaticModule } from '@nestjs/serve-static'; // <--- Import này
import { join } from 'path';
import { AmenityBookingsModule } from './amenity-bookings/amenity-bookings.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        entities: [Product], // <--- THÊM VÀO ĐÂY (hoặc để autoLoadEntities: true thì không cần)
        synchronize: true,
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Thư mục chứa ảnh
      serveRoot: '/uploads', // Đường dẫn truy cập (VD: localhost:3001/uploads/abc.jpg)
    }),
    UsersModule,
    AuthModule,
    ApartmentsModule,
    VehiclesModule,
    RequestsModule,
    InvoicesModule,
    AmenitiesModule,
    NotificationsModule,
    InvoiceItemsModule,
    AmenityBookingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
// 3. Sửa class AppModule như sau:
export class AppModule implements OnModuleInit {
  // Inject DataSource vào để kiểm tra kết nối
  constructor(private dataSource: DataSource) {}

  onModuleInit() {
    if (this.dataSource.isInitialized) {
      console.log('================================================');
      console.log('✅  KẾT NỐI DATABASE THÀNH CÔNG!  ✅');
      console.log('================================================');
    }
  }
}
