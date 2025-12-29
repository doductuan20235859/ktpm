import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { InvoiceFee, InvoiceStatus } from '../../common/enums/database.enums';

// DTO cho từng khoản mục phí bên trong
class CreateInvoiceItemDto {
  @IsEnum(InvoiceFee)
  feeType: InvoiceFee;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  amount: number;
}

// DTO cho hóa đơn tổng
export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsNumber()
  apartmentId: number; // ID căn hộ nhận hóa đơn

  @IsDateString()
  periodDate: string; // Kỳ thanh toán (VD: 2024-12-01)

  @IsDateString()
  dueDate: string; // Hạn thanh toán

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
