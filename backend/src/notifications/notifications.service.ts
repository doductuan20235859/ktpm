import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  // CREATE - Tạo thông báo mới (Admin only)
  async create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationsRepository.create({
      title: createNotificationDto.title,
      message: createNotificationDto.message,
      type: createNotificationDto.type,
      targetAudience: createNotificationDto.targetAudience,
      // Lưu ý: targetIds giờ là mảng string (VD: ["A-101"] hoặc ["1", "3"])
      targetIds: createNotificationDto.targetIds || undefined,
      createdBy: createNotificationDto.createdBy || null,
    });
    return this.notificationsRepository.save(notification);
  }

  // READ - Lấy tất cả thông báo (Admin)
  async findAll() {
    return this.notificationsRepository.find({
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  // READ - Lấy thông báo cho user cụ thể (Resident)
  async findForUser(userId: number, apartmentCode: string, userRole: string) {
    // 1. Ép kiểu dữ liệu để khớp với DB (TEXT[])
    const userIdStr = String(userId); // Chuyển số 3 thành chuỗi "3"
    const apartmentCodeStr = apartmentCode || ''; // Tránh null/undefined
    // --- THÊM LOG TẠI ĐÂY ---
    console.log('--- DEBUG NOTIFICATION SERVICE ---');
    console.log('Original UserId:', userId, typeof userId);
    console.log('Original AptCode:', apartmentCode, typeof apartmentCode);
    console.log('----------------------------------');
    console.log('Search ID (String):', userIdStr);
    console.log('Search Apt (String):', apartmentCodeStr);
    console.log('----------------------------------');
    // -------------------------

    const queryBuilder = this.notificationsRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.createdBy', 'createdBy')
      .orderBy('notification.createdAt', 'DESC');

    queryBuilder.andWhere(
      `(
        -- CASE 1: Lấy thông báo chung (ALL)
        notification.target_audience = 'ALL'
        
        -- CASE 2: Lấy thông báo theo căn hộ (APARTMENT)
        -- So sánh chuỗi (VD: 'A-101') với mảng chuỗi trong DB
        OR (
          notification.target_audience = 'APARTMENT' 
          AND :apartmentCodeStr = ANY(notification.target_ids)
        )
        
        -- CASE 3: Lấy thông báo theo Role (ROLE)
        -- Lưu ý: Mình sửa logic ở đây để tận dụng cột target_ids cho Role luôn
        OR (
          notification.target_audience = 'ROLE'
          AND :userRole = ANY(notification.target_ids)
        )
        
        -- CASE 4: Lấy thông báo riêng cho User (USER)
        -- So sánh chuỗi "3" với mảng chuỗi trong DB
        OR (
          notification.target_audience = 'USER'
          AND :userIdStr = ANY(notification.target_ids)
        )
      )`,
      {
        apartmentCodeStr,
        userRole,
        userIdStr,
      },
    );

    queryBuilder.limit(50);
    return queryBuilder.getMany();
  }

  // READ - Lấy chi tiết 1 thông báo
  async findOne(id: number) {
    return this.notificationsRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
  }

  // UPDATE - Cập nhật thông báo
  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    await this.notificationsRepository.update(id, {
      title: updateNotificationDto.title,
      message: updateNotificationDto.message,
      type: updateNotificationDto.type,
      targetAudience: updateNotificationDto.targetAudience,
      targetIds: updateNotificationDto.targetIds || undefined,
    });
    return this.findOne(id);
  }

  // DELETE - Xóa thông báo
  async remove(id: number) {
    const notification = await this.findOne(id);
    if (notification) {
      await this.notificationsRepository.remove(notification);
    }
    return notification;
  }

  async countUnreadForUser(userId: number) {
    return 0;
  }

  // UTILITY - Tạo thông báo cho toàn bộ cư dân
  async createForAllResidents(
    title: string,
    message: string,
    type: string,
    createdById?: number,
  ) {
    const notification = this.notificationsRepository.create({
      title,
      message,
      type,
      targetAudience: 'ALL',
      targetIds: undefined,
      createdBy: createdById ? ({ id: createdById } as any) : null,
    });
    return this.notificationsRepository.save(notification);
  }

  // UTILITY - Tạo thông báo cho căn hộ cụ thể
  async createForApartments(
    title: string,
    message: string,
    type: string,
    apartmentCodes: string[], // Nhận vào mảng mã căn hộ (string[])
    createdById?: number,
  ) {
    const notification = this.notificationsRepository.create({
      title,
      message,
      type,
      targetAudience: 'APARTMENT',
      targetIds: apartmentCodes, // Lưu thẳng mảng string vào cột TEXT[]
      createdBy: createdById ? ({ id: createdById } as any) : null,
    });
    return this.notificationsRepository.save(notification);
  }
}
