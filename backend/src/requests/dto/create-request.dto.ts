import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  RequestCategory,
  RequestPriority,
} from '../../common/enums/database.enums';

export class CreateRequestDto {
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString()
  title: string;

  @IsEnum(RequestCategory, { message: 'Hạng mục không hợp lệ' })
  category: RequestCategory;

  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority; // Mặc định sẽ là NORMAL nếu không gửi
}
