import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleDto } from './create-vehicle.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VehicleStatus } from '../../common/enums/database.enums';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
  @IsOptional()
  @IsEnum(VehicleStatus, { message: 'Trạng thái xe không hợp lệ' })
  status?: VehicleStatus;

  @IsOptional()
  @IsString()
  adminResponse?: string;
}
