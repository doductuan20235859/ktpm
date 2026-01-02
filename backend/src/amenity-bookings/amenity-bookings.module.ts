import { Module } from '@nestjs/common';
import { AmenityBookingsService } from './amenity-bookings.service';
import { AmenityBookingsController } from './amenity-bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmenityBooking } from './entities/amenity-booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AmenityBooking])],
  controllers: [AmenityBookingsController],
  providers: [AmenityBookingsService],
})
export class AmenityBookingsModule {}
