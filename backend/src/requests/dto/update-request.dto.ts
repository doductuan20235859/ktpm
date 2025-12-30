import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsInt 
} from 'class-validator';
import { 
  RequestCategory, 
  RequestPriority,
  RequestStatus 
} from '../../common/enums/database.enums';

export class UpdateRequestDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsInt({ message: 'ID căn hộ phải là số' })
  @IsOptional()
  apartmentId?: number;

  @IsEnum(RequestCategory, { message: 'Hạng mục không hợp lệ' })
  @IsOptional()
  category?: RequestCategory;

  @IsEnum(RequestPriority, { message: 'Mức độ ưu tiên không hợp lệ' })
  @IsOptional()
  priority?: RequestPriority;

  @IsEnum(RequestStatus, { message: 'Trạng thái không hợp lệ' })
  @IsOptional()
  status?: RequestStatus;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt({ message: 'ID người được giao phải là số' })
  @IsOptional()
  assignedToUserId?: number;
}
