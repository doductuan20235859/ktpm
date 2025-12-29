import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MaxLength,
} from 'class-validator'; // Bỏ IsInt vì không còn dùng cho targetIds nữa

export class CreateNotificationDto {
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString()
  @MaxLength(200, { message: 'Tiêu đề tối đa 200 ký tự' })
  title: string;

  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string; // 'info', 'warning', 'success', 'error'

  @IsNotEmpty({ message: 'Target audience không được để trống' })
  @IsEnum(['ALL', 'APARTMENT', 'ROLE', 'USER'], {
    message: 'Target audience phải là ALL, APARTMENT, ROLE, hoặc USER',
  })
  targetAudience: string;

  // --- PHẦN ĐÃ SỬA ---
  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Mỗi targetId phải là một chuỗi (string)' })
  targetIds?: string[]; // Đổi từ number[] sang string[]

  @IsOptional()
  createdBy?: any;
}
