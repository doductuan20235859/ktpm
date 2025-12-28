import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmenityBooking } from './entities/amenity-booking.entity';
import { Amenity } from './entities/amenity.entity';
import { BookingStatus } from '../common/enums/database.enums';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(AmenityBooking)
    private readonly bookingRepository: Repository<AmenityBooking>,
    @InjectRepository(Amenity)
    private readonly amenityRepository: Repository<Amenity>,
  ) {}

  async createBooking(
    amenityId: number,
    userId: number,
    bookingDate: string,
    timeSlot: string,
  ) {
    const amenity = await this.amenityRepository.findOne({
      where: { id: amenityId },
    });
    if (!amenity) throw new NotFoundException('Tiện ích không tồn tại');

    const existingBooking = await this.bookingRepository.findOne({
      where: {
        amenity: { id: amenityId },
        bookingDate: new Date(bookingDate),
        timeSlot: timeSlot,
        status: BookingStatus.APPROVED,
      },
    });

    if (existingBooking) {
      throw new BadRequestException('Khung giờ này đã được đặt chỗ');
    }

    const booking = this.bookingRepository.create({
      amenity: { id: amenityId },
      user: { id: userId },
      bookingDate: new Date(bookingDate),
      timeSlot,
      status: amenity.requiresApproval
        ? BookingStatus.PENDING
        : BookingStatus.APPROVED,
    });

    return await this.bookingRepository.save(booking);
  }

  async findAll() {
    return await this.bookingRepository.find({
      relations: ['amenity', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: number,
    status: BookingStatus,
    adminResponse?: string,
  ) {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Không tìm thấy đơn đặt chỗ');

    booking.status = status;
    if (adminResponse) {
      booking.adminResponse = adminResponse;
    }

    return await this.bookingRepository.save(booking);
  }
}
