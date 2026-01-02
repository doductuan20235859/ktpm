import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { AmenityStatus } from '../../common/enums/database.enums';

export class CreateAmenityDto {
  @IsString()
  @IsNotEmpty() // Tên bắt buộc phải có
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  // Bạn có thể validate regex giờ: @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  openingTime?: string;

  @IsString()
  @IsOptional()
  closingTime?: string;

  @IsNumber()
  @IsOptional()
  maxCapacity?: number;

  @IsNumber()
  @IsOptional()
  maxDurationMinutes?: number;

  @IsNumber()
  @IsOptional()
  maxBookingsPerMonth?: number;

  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @IsEnum(AmenityStatus)
  @IsOptional()
  status?: AmenityStatus;

  @IsArray()
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng là string
  @IsOptional()
  rules?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  bookingSlots?: string[];

  // LƯU Ý: Tuyệt đối KHÔNG khai báo isActive ở đây nếu bạn muốn chặn nó từ đầu.
  // Nếu bạn muốn cho phép gửi isActive lên (nhưng không làm gì) thì thêm dòng dưới:
  // @IsBoolean()
  // @IsOptional()
  // isActive?: boolean;
}
