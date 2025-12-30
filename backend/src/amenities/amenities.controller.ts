import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import type {
  AmenityNotification,
  CreateBookingDto,
} from './amenities.service';

interface UpdateStatusDto {
  status: string;
  adminResponse?: string;
}

@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Get('dashboard/stats')
  async getStats() {
    return await this.amenitiesService.getDashboardStats();
  }

  @Get('bookings/all')
  async findAllBookings() {
    return await this.amenitiesService.findAllBookings();
  }

  @Get('my-bookings')
  async getMyBookings(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<any[]> {
    return await this.amenitiesService.findBookingsByUser(userId);
  }

  @Get('notifications/:userId')
  async getNotifications(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<AmenityNotification[]> {
    return await this.amenitiesService.findNotificationsByUser(userId);
  }

  @Post(':amenityId/bookings')
  async createBooking(
    @Param('amenityId', ParseIntPipe) amenityId: number,
    @Body() dto: CreateBookingDto,
  ) {
    return await this.amenitiesService.createBooking(amenityId, dto);
  }

  @Patch('bookings/:id/status')
  async updateBookingStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStatusDto,
  ) {
    return await this.amenitiesService.updateBookingStatus(
      id,
      body.status,
      body.adminResponse,
    );
  }

  /**
   * ENDPOINT: Hủy lịch đặt chỗ dành cho User
   */
  @Delete('bookings/:id')
  async cancelBooking(@Param('id', ParseIntPipe) id: number) {
    return await this.amenitiesService.cancelBooking(id);
  }

  @Get()
  async findAll() {
    return await this.amenitiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.amenitiesService.findOne(id);
  }

  @Post()
  async create(@Body() createAmenityDto: Record<string, unknown>) {
    return await this.amenitiesService.create(createAmenityDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAmenityDto: Record<string, unknown>,
  ) {
    return await this.amenitiesService.update(id, updateAmenityDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.amenitiesService.remove(id);
  }
}
