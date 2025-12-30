import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { InvoiceItemDto } from "../../invoice_items/dto/create-invoice_item.dto";
import { Type } from "class-transformer";

// create-invoice.dto.ts
export class CreateInvoiceDto {
  
  @IsString()
  @IsNotEmpty()
  building: string;
  
  @IsString()
  @IsNotEmpty()
  apartmentCode: string;

  @IsString()
  @IsNotEmpty()
  period: string;

  @IsString()
  @IsNotEmpty()
  dueDate: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  totalAmount: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  paidAmount: number;

  @IsArray() // Đảm bảo nhận được mảng items từ frontend
  @ValidateNested({ each: true }) // Kiểm tra tất cả các phần tử trong mảng
  @Type(() => InvoiceItemDto)    // Xác định kiểu dữ liệu của phần tử là InvoiceItemDto
  @IsOptional()
  items: InvoiceItemDto[];
}