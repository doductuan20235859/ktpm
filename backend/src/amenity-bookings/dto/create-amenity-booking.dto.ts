// src/amenity-bookings/dto/create-booking.dto.ts
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  amenityId: number; // Cần ID để biết đặt cái gì

  @IsNotEmpty()
  userId: number; // Cần ID để biết ai đặt

  @IsNotEmpty()
  bookingDate: string; // Dạng "2025-12-25"

  @IsNotEmpty()
  timeSlot: string; // Dạng "08:00-10:00"

  @IsOptional()
  notes?: string; // Ghi chú (tùy chọn)
}
