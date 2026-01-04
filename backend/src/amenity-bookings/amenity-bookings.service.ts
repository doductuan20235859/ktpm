// src/amenity-bookings/amenity-bookings.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmenityBooking } from './entities/amenity-booking.entity';
import { UpdateBookingStatusDto } from './dto/update-amenity-booking.dto';
import { CreateBookingDto } from './dto/create-amenity-booking.dto';
import { BookingStatus } from '../common/enums/database.enums';

@Injectable()
export class AmenityBookingsService {
  constructor(
    @InjectRepository(AmenityBooking)
    private bookingRepository: Repository<AmenityBooking>,
  ) {}

  /**
   * 1. LẤY TẤT CẢ DỮ LIỆU (Có thể lọc theo amenityId nếu truyền vào)
   */
  async findAll(amenityId?: number) {
    const query = this.bookingRepository.createQueryBuilder('booking');

    // Join bảng để lấy thông tin chi tiết
    query
      .leftJoinAndSelect('booking.amenity', 'amenity') // Lấy tên tiện ích
      .leftJoinAndSelect('booking.user', 'user') // Lấy tên cư dân
      .orderBy('booking.createdAt', 'DESC'); // Mới nhất lên đầu

    // Nếu có truyền amenityId thì lọc
    if (amenityId) {
      query.where('booking.amenityId = :amenityId', { amenityId });
    }

    // Chọn các trường cần thiết của User để tránh lộ Password
    // query.select([
    //   'booking',
    //   'amenity.id',
    //   'amenity.name',
    //   'user.id',
    //   'user.fullName',
    //   'user.apartmentNumber',
    // ]);

    return query.getMany();
  }

  /**
   * 2. TÌM MỘT ĐƠN (Chi tiết)
   */
  async findOne(id: number) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['amenity', 'user'],
    });

    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn đặt lịch ID: ${id}`);
    }
    return booking;
  }

  /**
   * 3. CẬP NHẬT TRẠNG THÁI (Duyệt/Từ chối)
   * Cập nhật dựa trên ID của đơn booking
   */
  async updateStatus(id: number, data: UpdateBookingStatusDto) {
    const booking = await this.findOne(id); // Kiểm tra tồn tại trước

    // Cập nhật trạng thái
    booking.status = data.status;

    // Nếu có phản hồi từ admin (lý do từ chối), cập nhật luôn
    if (data.adminResponse !== undefined) {
      booking.adminResponse = data.adminResponse;
    }

    return this.bookingRepository.save(booking);
  }
  async findByUser(userId: number) {
    const bookings = await this.bookingRepository.find({
      where: {
        user: { id: userId }, // Điều kiện lọc theo User ID
      },
      relations: ['amenity'], // Join bảng Amenity để lấy tên, hình ảnh...
      order: {
        createdAt: 'DESC', // Sắp xếp cái mới nhất lên đầu
      },
    });

    // (Tùy chọn) Format lại dữ liệu cho gọn nếu cần,
    // hoặc trả về nguyên gốc để Frontend tự map
    return bookings.map((booking) => ({
      id: booking.id,
      amenityName: booking.amenity.name, // Lấy tên từ quan hệ amenity
      date: booking.bookingDate,
      timeSlot: booking.timeSlot,
      status: booking.status,
      createdDate: booking.createdAt,
      adminResponse: booking.adminResponse, // Lý do từ chối (nếu có)
    }));
  }
  async create(createDto: CreateBookingDto) {
    const newBooking = this.bookingRepository.create({
      // SỬA Ở ĐÂY: Thay vì gán amenityId, hãy gán object chứa id
      amenity: { id: createDto.amenityId },
      user: { id: createDto.userId },

      bookingDate: createDto.bookingDate, // Đảm bảo format YYYY-MM-DD
      timeSlot: createDto.timeSlot,
      notes: createDto.notes,
      status: BookingStatus.PENDING, // Dùng Enum import từ file chung
    });

    return await this.bookingRepository.save(newBooking);
  }
}
