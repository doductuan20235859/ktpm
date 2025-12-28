import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { VehicleType } from '../../common/enums/database.enums'; // Đảm bảo đường dẫn đúng

export class CreateVehicleDto {
  @IsNotEmpty({ message: 'Biển số xe không được để trống' })
  @IsString()
  plateNumber: string;

  @IsNotEmpty({ message: 'Loại xe không được để trống' })
  @IsEnum(VehicleType, { message: 'Loại xe phải là CAR hoặc MOTORCYCLE' })
  type: VehicleType;

  @IsNotEmpty({ message: 'Thương hiệu xe không được để trống' })
  @IsString()
  brand: string;

  @IsNotEmpty({ message: 'Màu xe không được để trống' })
  @IsString()
  color: string;
}
