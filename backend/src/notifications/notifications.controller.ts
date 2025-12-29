import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // CREATE - Tạo thông báo mới (Admin only)
  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto, @Request() req) {
    // TODO: Add admin role guard
    return this.notificationsService.create({
      ...createNotificationDto,
      createdBy: { id: req.user.sub },
    });
  }

  // READ - Lấy tất cả thông báo (Admin only)
  @Get()
  findAll(@Request() req) {
    // TODO: Add admin role guard
    return this.notificationsService.findAll();
  }

  // READ - Lấy thông báo của user hiện tại
  @Get('my-notifications')
  async getMyNotifications(@Request() req) {
    // req.user lấy từ payload của token đã giải mã
    // Payload của bạn: { sub: 3, apartmentCode: "A-101", role: "RESIDENT", ... }
    const user = req.user;

    return this.notificationsService.findForUser(
      user.userId, // Lấy từ sub (3)
      user.apartmentCode, // Lấy từ apartmentCode ("A-101")
      user.role, // Lấy từ role ("RESIDENT")
    );
  }
  // READ - Lấy chi tiết 1 thông báo
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.findOne(id);
  }

  // UPDATE - Cập nhật thông báo (Admin only)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    // TODO: Add admin role guard
    return this.notificationsService.update(id, updateNotificationDto);
  }

  // DELETE - Xóa thông báo (Admin only)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // TODO: Add admin role guard
    return this.notificationsService.remove(id);
  }

  // UTILITY - Đếm thông báo chưa đọc
  @Get('count/unread')
  async countUnread(@Request() req) {
    const userId = req.user.sub;
    const count = await this.notificationsService.countUnreadForUser(userId);
    return { unread: count };
  }
}
