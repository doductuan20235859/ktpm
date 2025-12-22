import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmenitiesService } from './amenities.service';
import { AmenitiesController } from './amenities.controller';
import { Amenity } from './entities/amenity.entity';
import { AmenityBooking } from './entities/amenity-booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Amenity, AmenityBooking])], // <--- Đăng ký
  controllers: [AmenitiesController],
  providers: [AmenitiesService],
})
export class AmenitiesModule {}
