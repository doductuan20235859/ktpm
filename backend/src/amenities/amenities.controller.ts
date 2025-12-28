import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { BookingsService } from './bookings.service';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import { BookingStatus } from '../common/enums/database.enums';

@Controller('amenities')
export class AmenitiesController {
  constructor(
    private readonly amenitiesService: AmenitiesService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Post()
  create(@Body() createAmenityDto: CreateAmenityDto) {
    return this.amenitiesService.create(createAmenityDto);
  }

  @Get()
  findAll() {
    return this.amenitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.amenitiesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAmenityDto: UpdateAmenityDto,
  ) {
    return this.amenitiesService.update(id, updateAmenityDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.amenitiesService.remove(id);
  }

  @Post(':id/bookings')
  async createBooking(
    @Param('id', ParseIntPipe) amenityId: number,
    @Body('userId') userId: number,
    @Body('bookingDate') bookingDate: string,
    @Body('timeSlot') timeSlot: string,
  ) {
    return this.bookingsService.createBooking(
      amenityId,
      userId,
      bookingDate,
      timeSlot,
    );
  }

  @Get('bookings/all')
  findAllBookings() {
    return this.bookingsService.findAll();
  }

  @Patch('bookings/:id/status')
  async updateBookingStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: BookingStatus,
    @Body('adminResponse') adminResponse?: string,
  ) {
    return this.bookingsService.updateStatus(id, status, adminResponse);
  }
}
