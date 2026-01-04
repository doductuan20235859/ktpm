// src/amenity-bookings/amenity-bookings.controller.ts
import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AmenityBookingsService } from './amenity-bookings.service';
import { UpdateBookingStatusDto } from './dto/update-amenity-booking.dto';

@Controller('amenity-bookings')
export class AmenityBookingsController {
  constructor(private readonly bookingService: AmenityBookingsService) {}

  // 1. GET /amenity-bookings
  // Có thể gọi: /amenity-bookings?amenityId=1 để lọc
  @Get()
  findAll(@Query('amenityId') amenityId?: string) {
    // Chuyển string sang number nếu có
    const id = amenityId ? parseInt(amenityId) : undefined;
    return this.bookingService.findAll(id);
  }

  // 2. GET /amenity-bookings/:id (Chi tiết 1 đơn)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.findOne(id);
  }

  // 3. PATCH /amenity-bookings/:id/status (Duyệt/Từ chối)
  // Payload gửi lên: { "status": "APPROVED", "adminResponse": "..." }
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBookingStatusDto,
  ) {
    return this.bookingService.updateStatus(id, updateDto);
  }
  @Get('user/:id')
  findByUser(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.findByUser(id);
  }
}
