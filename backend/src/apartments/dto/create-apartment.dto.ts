import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { ApartmentStatus } from '../../common/enums/database.enums';

export class CreateApartmentDto {


  @IsNotEmpty()
  @IsString()
  unitNumber: string;   // 202

  @IsNotEmpty()
  @IsString()
  buildingName: string; // Tòa A

  @IsNumber()
  @Min(1)
  floorNumber: number;

  @IsNumber()
  @Min(0)
  areaSqm: number;

  @IsEnum(ApartmentStatus)
  status: ApartmentStatus;
}
