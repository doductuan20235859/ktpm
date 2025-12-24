import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
// Lưu ý: Import UserRole từ file entity hoặc file shared enum của bạn
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Họ và tên không được quá 100 ký tự' })
  fullName: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString()
  @MaxLength(15, { message: 'Số điện thoại không được quá 15 ký tự' })
  // Regex kiểm tra số điện thoại Việt Nam cơ bản (tùy chọn)
  @Matches(/^[0-9]+$/, { message: 'Số điện thoại chỉ được chứa chữ số' })
  phoneNumber: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ (ADMIN hoặc RESIDENT)' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
