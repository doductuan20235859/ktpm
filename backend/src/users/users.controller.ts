import {
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard) // Yêu cầu phải đăng nhập
  @UseInterceptors(
    FileInterceptor('avatar', {
      // 'avatar' là tên field trong FormData gửi từ frontend
      storage: diskStorage({
        destination: './uploads', // Lưu vào thư mục uploads ở gốc dự án
        filename: (req, file, callback) => {
          // Tạo tên file ngẫu nhiên để tránh trùng
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Chỉ cho phép ảnh
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException('Chỉ chấp nhận file ảnh!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
      },
    }),
  )
  async uploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không có file nào được tải lên');
    }

    // 1. Tạo đường dẫn ảnh (Full URL)
    // Lưu ý: Port 3001 là port backend của bạn
    const avatarUrl = `http://localhost:3001/uploads/${file.filename}`;

    // 2. Lấy User ID từ Token (do JwtAuthGuard giải mã)
    const userId = req.user.userId || req.user.sub || req.user.id;

    // 3. Gọi Service để update vào DB
    await this.usersService.updateAvatar(userId, avatarUrl);

    return {
      message: 'Cập nhật ảnh đại diện thành công',
      avatarUrl: avatarUrl,
    };
  }
  @Post('change-password')
  @UseGuards(JwtAuthGuard) // Bắt buộc phải đăng nhập
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    // Lấy userId từ Token (do JwtStrategy giải mã)
    const userId = req.user.userId || req.user.sub || req.user.id;

    return this.usersService.changePassword(userId, changePasswordDto);
  }

  // Public endpoint for simple user stats used by admin dashboard
  @Get('stats')
  stats() {
    return this.usersService.getStats();
  }
}
