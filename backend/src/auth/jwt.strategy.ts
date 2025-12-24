// src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      // 1. Lấy token từ Header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 2. Secret Key phải trùng với lúc đăng nhập (Lấy từ .env)
      secretOrKey: configService.get<string>('JWT_SECRET') || 'yourSecretKey',
    });
  }

  // 3. Hàm này chạy sau khi Token đã được xác thực thành công
  async validate(payload: any) {
    // payload là dữ liệu bạn đã sign trong AuthService (sub, phone, role...)

    // Trả về object này, nó sẽ được gắn vào req.user trong Controller
    return {
      userId: payload.sub,
      phone: payload.phone,
      role: payload.role,
      apartmentCode: payload.apartmentCode,
    };
  }
}
