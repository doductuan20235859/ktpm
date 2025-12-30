import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { Amenity } from './entities/amenity.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Amenity)
    private amenityRepository: Repository<Amenity>,
  ) {}

  // Lấy tất cả lịch đặt để Admin quản lý hoặc Frontend check trống
  async findAll(): Promise<Booking[]> {
    return await this.bookingRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // Logic tạo lịch đặt mới từ cư dân
  async createBooking(
    amenityId: number,
    userId: number,
    bookingDate: string,
    timeSlot: string,
  ): Promise<Booking> {
    // 1. Kiểm tra xem tiện ích có tồn tại không
    const amenity = await this.amenityRepository.findOne({
      where: { id: amenityId },
    });
    if (!amenity) {
      throw new NotFoundException('Không tìm thấy tiện ích này');
    }

    // 2. Tạo đối tượng booking mới
    const newBooking = this.bookingRepository.create({
      amenityId,
      userId,
      bookingDate,
      timeSlot,
      amenityName: amenity.name, // Lưu tên để hiển thị nhanh ở Frontend
      status: 'PENDING',
    });

    return await this.bookingRepository.save(newBooking);
  }

  // Cập nhật trạng thái (Duyệt/Từ chối) bởi Admin
  async updateStatus(
    id: number,
    status: string,
    adminResponse?: string,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Không tìm thấy lịch đặt này');
    }

    booking.status = status;
    if (adminResponse) {
      booking.adminResponse = adminResponse;
    }

    return await this.bookingRepository.save(booking);
  }
}
