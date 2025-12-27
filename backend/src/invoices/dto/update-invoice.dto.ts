import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateInvoiceDto {
  @IsNumber()
  @IsNotEmpty()
  paidAmount: number;
}