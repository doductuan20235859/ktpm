// src/auth/dto/login.dto.ts
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { UserRole } from '../../common/enums/database.enums'; // Import Enum bạn đã tạo

export class LoginDto {
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString()
  phoneNumber: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  password: string;

  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ (ADMIN hoặc RESIDENT)' })
  role: UserRole;
}
