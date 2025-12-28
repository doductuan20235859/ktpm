import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEnum, 
  IsInt 
} from 'class-validator';
import { 
  RequestCategory, 
  RequestPriority 
} from '../../common/enums/database.enums';

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string; // Tiêu đề

  @IsInt({ message: 'ID căn hộ phải là số' })
  @IsNotEmpty({ message: 'Mã căn hộ là bắt buộc' })
  apartmentId: number; // ID của căn hộ

  // Lưu ý: Tòa nhà thường được xác định thông qua Apartment, 
  // nên không cần field buildingId nếu Apartment đã có quan hệ với Building.
  // Nếu bạn vẫn muốn truyền từ FE:
  @IsString()
  @IsOptional()
  buildingId?: string; 

  @IsInt()
  @IsNotEmpty({ message: 'Người tạo là bắt buộc' })
  createdByUserId: number; // ID của người tạo (User)

  @IsEnum(RequestCategory, { message: 'Hạng mục không hợp lệ' })
  @IsNotEmpty()
  category: RequestCategory; // Hạng mục

  @IsEnum(RequestPriority, { message: 'Mức độ ưu tiên không hợp lệ' })
  @IsOptional()
  priority?: RequestPriority; // Mức độ ưu tiên

  @IsString()
  @IsOptional()
  description?: string; // Mô tả chi tiết
}