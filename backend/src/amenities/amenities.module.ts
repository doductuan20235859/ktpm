import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmenitiesService } from './amenities.service';
import { BookingsService } from './bookings.service';
import { AmenitiesController } from './amenities.controller';
import { Amenity } from './entities/amenity.entity';
import { AmenityBooking } from './entities/amenity-booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Amenity, AmenityBooking])],
  controllers: [AmenitiesController],
  providers: [AmenitiesService, BookingsService],
  exports: [AmenitiesService, BookingsService],
})
export class AmenitiesModule {}
