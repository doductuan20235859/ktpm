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

    // 1. Tìm user trong DB và JOIN lấy thông tin căn hộ (chỉ 1 lần truy vấn)
    const query = this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash') // Lấy mật khẩu để so sánh
      .where('user.phoneNumber = :phoneNumber', { phoneNumber });

    // Nếu là Resident, join bảng residents và apartment để lấy thông tin
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

    // 5. Xử lý lấy mã căn hộ và ID căn hộ từ kết quả query trên
    let apartmentCode: string | null = null;
    let apartmentId: number | null = null;

    if (user.role === UserRole.RESIDENT && user.residents?.length > 0) {
      const activeResidency = user.residents[0];
      if (activeResidency?.apartment) {
        apartmentCode = activeResidency.apartment.code;
        apartmentId = activeResidency.apartment.id; // Lấy ID căn hộ
      }
    }

    // 6. Tạo Token (QUAN TRỌNG: Phải nhét apartmentId vào đây)
    const payload = {
      sub: user.id,
      phone: user.phoneNumber,
      role: user.role,
      apartmentCode: apartmentCode,
      apartmentId: apartmentId, // <--- Thêm dòng này để Backend đọc được khi gửi Request
    };

    // 7. Chuẩn bị dữ liệu trả về cho Client
    const { passwordHash, residents, ...userInfo } = user;

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        ...userInfo,
        apartmentCode: apartmentCode,
        apartmentId: apartmentId, // <--- Trả về cho Frontend lưu (nếu cần)
      },
    };
  }
}
