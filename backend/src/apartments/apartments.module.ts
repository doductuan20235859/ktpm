// src/apartments/apartments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApartmentsService } from './apartments.service';
import { ApartmentsController } from './apartments.controller';

// Import các Entity của module này
import { Apartment } from './entities/apartment.entity';
import { ApartmentResident } from './entities/apartment-resident.entity';
import { ResidencyHistory } from './entities/residency-history.entity';
import { User } from '../users/entities/user.entity';
@Module({
  imports: [
    // QUAN TRỌNG: Đăng ký Entity để TypeORM nhận diện
    TypeOrmModule.forFeature([Apartment, ApartmentResident, ResidencyHistory, User]),
  ],
  controllers: [ApartmentsController],
  providers: [ApartmentsService],
  exports: [ApartmentsService], // Export nếu module khác cần dùng service này
})
export class ApartmentsModule {}
