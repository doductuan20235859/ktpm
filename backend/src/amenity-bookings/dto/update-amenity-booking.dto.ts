// src/amenity-bookings/dto/update-booking-status.dto.ts
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '../../common/enums/database.enums';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status: BookingStatus; // APPROVED, REJECTED, CANCELLED...

  @IsOptional()
  @IsString()
  adminResponse?: string; // Lý do từ chối (nếu có)
}
