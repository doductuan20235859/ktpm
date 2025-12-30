import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Amenity, AmenityStatus } from './entities/amenity.entity';
import { AmenityBooking } from './entities/amenity-booking.entity';
import { BookingStatus } from '../common/enums/database.enums';

export interface AmenityNotification {
  id: string;
  type: 'REMINDER' | 'APPROVED' | 'REJECTED';
  title: string;
  message: string;
  date: string;
  isNew: boolean;
}

export interface CreateBookingDto {
  bookingDate: Date;
  timeSlot: string;
  notes?: string;
  userId: number;
}

interface AmenityWithVirtualFields extends Omit<Amenity, 'status'> {
  isActive?: boolean;
  status?: AmenityStatus | string;
}

@Injectable()
export class AmenitiesService {
  constructor(
    @InjectRepository(Amenity)
    private readonly amenityRepo: Repository<Amenity>,
    @InjectRepository(AmenityBooking)
    private readonly bookingRepo: Repository<AmenityBooking>,
  ) {}

  async findAll(): Promise<Amenity[]> {
    return await this.amenityRepo.find();
  }

  async findOne(id: number): Promise<Amenity> {
    const amenity = await this.amenityRepo.findOne({ where: { id } });
    if (!amenity) {
      throw new NotFoundException('Không tìm thấy tiện ích');
    }
    return amenity;
  }

  async create(dto: Partial<Amenity>): Promise<Amenity> {
    return await this.amenityRepo.save(dto as Amenity);
  }

  async update(id: number, dto: Partial<Amenity>): Promise<void> {
    const updateData: Record<string, unknown> = { ...dto };
    delete updateData.id;
    await this.amenityRepo.update(
      id,
      updateData as unknown as QueryDeepPartialEntity<Amenity>,
    );
  }

  async remove(id: number): Promise<void> {
    await this.amenityRepo.delete(id);
  }

  async findBookingsByUser(userId: number): Promise<AmenityBooking[]> {
    const whereClause: FindOptionsWhere<AmenityBooking> = {
      user: { id: userId } as unknown as FindOptionsWhere<object>,
    };

    return await this.bookingRepo.find({
      where: whereClause,
      relations: ['amenity'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * CHỨC NĂNG MỚI: Hủy lịch đặt chỗ cho User
   */
  async cancelBooking(id: number): Promise<void> {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Không tìm thấy lịch đặt để hủy');
    }
    await this.bookingRepo.delete(id);
  }

  async createBooking(
    amenityId: number,
    dto: CreateBookingDto,
  ): Promise<AmenityBooking> {
    const newBooking = this.bookingRepo.create({
      bookingDate: dto.bookingDate,
      timeSlot: dto.timeSlot,
      notes: dto.notes,
      amenity: { id: amenityId } as Amenity,
      user: { id: dto.userId } as unknown as object,
      status: BookingStatus.PENDING,
    });
    return await this.bookingRepo.save(newBooking);
  }

  async findAllBookings(): Promise<AmenityBooking[]> {
    return await this.bookingRepo.find({
      relations: ['amenity', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getDashboardStats() {
    const amenities =
      (await this.amenityRepo.find()) as AmenityWithVirtualFields[];
    const bookings = await this.bookingRepo.find();
    const todayStr = new Date().toDateString();

    return {
      total: amenities.length,
      active: amenities.filter((a) => a.isActive !== false && a.maxCapacity > 0)
        .length,
      today: bookings.filter(
        (b) => new Date(b.createdAt).toDateString() === todayStr,
      ).length,
      pending: bookings.filter((b) => b.status === BookingStatus.PENDING)
        .length,
      maintenance: amenities.filter(
        (a) => a.maxCapacity === 0 || a.status === 'MAINTENANCE',
      ).length,
    };
  }

  async updateBookingStatus(
    id: number,
    status: string,
    adminResponse?: string,
  ): Promise<void> {
    const bookingStatus = status as unknown as BookingStatus;
    const updateData: Record<string, unknown> = {
      status: bookingStatus,
      adminResponse: adminResponse || null,
    };

    await this.bookingRepo.update(
      id,
      updateData as unknown as QueryDeepPartialEntity<AmenityBooking>,
    );
  }

  async findNotificationsByUser(
    userId: number,
  ): Promise<AmenityNotification[]> {
    const whereClause: FindOptionsWhere<AmenityBooking> = {
      user: { id: userId } as unknown as FindOptionsWhere<object>,
    };

    const bookings = await this.bookingRepo.find({
      where: whereClause,
      relations: ['amenity'],
      order: { createdAt: 'DESC' },
    });

    const today = new Date();
    const notifications: AmenityNotification[] = [];

    bookings.forEach((booking) => {
      const bDate = new Date(booking.bookingDate);
      const diffDays = Math.ceil(
        (bDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (
        booking.status === BookingStatus.APPROVED &&
        diffDays <= 2 &&
        diffDays >= 0
      ) {
        notifications.push({
          id: `remind-${booking.id}`,
          type: 'REMINDER',
          title: 'Nhắc nhở: Lịch sắp đến',
          message: `Bạn có lịch đặt ${
            booking.amenity?.name || 'tiện ích'
          } vào ngày ${String(booking.bookingDate)}.`,
          date: today.toISOString().split('T')[0],
          isNew: true,
        });
      }

      if (booking.status === BookingStatus.APPROVED) {
        notifications.push({
          id: `appr-${booking.id}`,
          type: 'APPROVED',
          title: 'Lịch đặt được duyệt',
          message: `Yêu cầu đặt ${
            booking.amenity?.name || 'tiện ích'
          } ngày ${String(booking.bookingDate)} thành công.`,
          date: booking.createdAt.toISOString().split('T')[0],
          isNew: false,
        });
      }

      if (booking.status === BookingStatus.REJECTED) {
        notifications.push({
          id: `rej-${booking.id}`,
          type: 'REJECTED',
          title: 'Lịch đặt bị từ chối',
          message: `Lịch bị từ chối. Lý do: ${
            booking.adminResponse || 'Bảo trì hệ thống'
          }`,
          date: booking.createdAt.toISOString().split('T')[0],
          isNew: false,
        });
      }
    });

    return notifications;
  }
}
