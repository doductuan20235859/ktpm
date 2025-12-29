


import { PartialType } from '@nestjs/mapped-types';
import { CreateApartmentDto } from './create-apartment.dto';
import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import { ApartmentStatus } from '../../common/enums/database.enums';

export class UpdateApartmentDto extends PartialType(CreateApartmentDto) {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsNumber()
  areaSqm?: number;

  @IsOptional()
  @IsEnum(ApartmentStatus)
  status?: ApartmentStatus;

  @IsOptional()
  @IsNumber()
  ownerId?: number; // Dùng ID để cập nhật chủ sở hữu thay vì tên text

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;
}