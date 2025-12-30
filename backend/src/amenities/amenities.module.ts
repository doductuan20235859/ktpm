import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmenitiesService } from './amenities.service';
import { AmenitiesController } from './amenities.controller';
import { Amenity } from './entities/amenity.entity';
import { AmenityBooking } from './entities/amenity-booking.entity';

@Module({
  imports: [
    // Đăng ký cả 2 Entity để TypeORM khởi tạo Metadata
    TypeOrmModule.forFeature([Amenity, AmenityBooking]),
  ],
  controllers: [AmenitiesController],
  providers: [AmenitiesService],
  exports: [AmenitiesService],
})
export class AmenitiesModule {}
