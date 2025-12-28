import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateAmenityDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  openingTime?: string;

  @IsString()
  @IsOptional()
  closingTime?: string;

  @IsNumber()
  @IsOptional()
  maxCapacity?: number;

  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @IsArray()
  @IsOptional()
  rules?: string[];

  @IsArray()
  @IsOptional()
  bookingSlots?: string[];
}
