import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; // 1. Import TypeOrmModule
import { User } from './entities/user.entity'; // 2. Import User Entity
@Module({
  imports: [
    // 3. QUAN TRỌNG: Đăng ký User Entity ở đây để tạo Repository
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export nếu các module khác (như AuthModule) cần dùng UsersService
})
export class UsersModule {}
