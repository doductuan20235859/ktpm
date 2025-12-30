import { IsString, IsNumber, IsNotEmpty } from "class-validator";

export class InvoiceItemDto {

  @IsString()
  @IsNotEmpty()
  feeType: string; // Ví dụ: "Tiền điện"

  @IsString()
  @IsNotEmpty()
  description: string; // Ví dụ: "Số điện tiêu thụ: 100 kWh"

  @IsNumber()
  @IsNotEmpty()
  amount: number; // Ví dụ: 500000
}