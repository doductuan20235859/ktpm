import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../common/enums/database.enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { phoneNumber, password, role } = loginDto;

    // 1. Tìm user trong DB và JOIN lấy thông tin căn hộ
    const query = this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash') // Lấy mật khẩu để so sánh
      .where('user.phoneNumber = :phoneNumber', { phoneNumber });

    // Nếu là Resident, ta cần join thêm bảng để lấy mã căn hộ
    if (role === UserRole.RESIDENT) {
      query
        .leftJoinAndSelect(
          'user.residents',
          'resident',
          'resident.isActive = :isActive',
          { isActive: true },
        )
        .leftJoinAndSelect('resident.apartment', 'apartment');
    }

    const user = await query.getOne();

    // 2. Kiểm tra user tồn tại
    if (!user) {
      throw new UnauthorizedException(
        'Số điện thoại hoặc mật khẩu không chính xác',
      );
    }

    // 3. Kiểm tra Role
    if (user.role !== role) {
      throw new UnauthorizedException(`Tài khoản này không phải là ${role}`);
    }

    // 4. So sánh mật khẩu
    if (user.passwordHash !== password) {
      throw new UnauthorizedException(
        'Số điện thoại hoặc mật khẩu không chính xác',
      );
    }

    // 5. Xử lý lấy mã căn hộ
    let apartmentCode: string | null = null;
    // --- SỬA LỖI TẠI ĐÂY: Đổi từ string sang number ---
    let apartmentId: number | null = null;

    if (user.role === UserRole.RESIDENT && user.residents?.length > 0) {
      const activeResidency = user.residents[0];
      if (activeResidency?.apartment) {
        apartmentCode = activeResidency.apartment.code;
        apartmentId = activeResidency.apartment.id; // id trong DB là number
      }
    }

    // 6. Tạo Token
    const payload = {
      sub: user.id,
      phone: user.phoneNumber,
      role: user.role,
      apartmentCode: apartmentCode,
    };

    // 7. Chuẩn bị dữ liệu trả về
    const { passwordHash, residents, ...userInfo } = user;

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        ...userInfo,
        apartmentCode: apartmentCode,
        apartmentId: apartmentId,
      },
    };
  }
}
