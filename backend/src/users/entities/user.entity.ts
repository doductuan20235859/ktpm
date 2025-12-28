import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

// Import các Entity liên quan (Giả sử bạn sẽ tạo chúng trong các module tương ứng)
// Nếu chưa có các file này, bạn có thể comment lại phần Relation bên dưới để chạy thử trước.
import { ApartmentResident } from '../../apartments/entities/apartment-resident.entity';
import { Apartment } from '../../apartments/entities/apartment.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Request } from '../../requests/entities/request.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { AmenityBooking } from '../../amenities/entities/amenity-booking.entity';

// Định nghĩa Enum ngay tại đây hoặc import từ file shared
export enum UserRole {
  ADMIN = 'ADMIN',
  RESIDENT = 'RESIDENT',
}

@Entity('users') // Tên bảng trong Database
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ name: 'phone_number', length: 15, unique: true })
  phoneNumber: string;

  @Column({
    name: 'password_hash',
    select: false, // Quan trọng: Mặc định không select password khi query user
    default: '123456', // <--- Thêm dòng này: Mật khẩu mặc định cho user cũ
  })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.RESIDENT,
  })
  role: UserRole;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // --- RELATIONS (Mối quan hệ) ---

  // 1. Các căn hộ mà user này sở hữu (Là chủ nhà)
  @OneToMany(() => Apartment, (apartment) => apartment.owner)
  ownedApartments: Apartment[];

  // 2. Các thông tin cư trú (Lịch sử ở, vai trò trong các căn hộ)
  // Đây là bảng trung gian apartment_residents
  @OneToMany(() => ApartmentResident, (resident) => resident.user)
  residents: ApartmentResident[];

  // 3. Xe cộ của user
  @OneToMany(() => Vehicle, (vehicle) => vehicle.user)
  vehicles: Vehicle[];

  // 4. Các yêu cầu (Requests) do user này TẠO ra
  @OneToMany(() => Request, (request) => request.createdBy)
  createdRequests: Request[];

  // 5. Các yêu cầu (Requests) được GIAO cho user này xử lý (nếu là Staff/Admin)
  @OneToMany(() => Request, (request) => request.assignedTo)
  assignedRequests: Request[];

  // 6. Các thông báo do user này tạo (Admin tạo thông báo)
  @OneToMany(() => Notification, (notification) => notification.createdBy)
  createdNotifications: Notification[];

  // 7. Lịch sử đặt tiện ích (Booking)
  @OneToMany(() => AmenityBooking, (booking) => booking.user)
  bookings: AmenityBooking[];
}
