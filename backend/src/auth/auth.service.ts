import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { phoneNumber, password, role } = loginDto;

    // 1. Tìm user trong DB
    // Vẫn cần addSelect vì cột passwordHash đang ẩn (select: false) trong Entity
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.phoneNumber = :phoneNumber', { phoneNumber })
      .getOne();

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

    // 4. SO SÁNH TRỰC TIẾP (KHÔNG DÙNG BCRYPT)
    // Lưu ý: Lúc này trong DB cột password_hash sẽ lưu chuỗi "123456" chứ không phải mã băm
    if (user.passwordHash !== password) {
      throw new UnauthorizedException(
        'Số điện thoại hoặc mật khẩu không chính xác',
      );
    }

    // 5. Tạo Token
    const payload = { sub: user.id, phone: user.phoneNumber, role: user.role };

    // Loại bỏ password ra khỏi object trả về
    const { passwordHash, ...userInfo } = user;

    return {
      accessToken: this.jwtService.sign(payload),
      user: userInfo,
    };
  }
}
