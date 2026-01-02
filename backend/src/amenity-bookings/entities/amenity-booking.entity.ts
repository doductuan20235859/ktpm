import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Amenity } from '../../amenities/entities/amenity.entity';
import { User } from '../../users/entities/user.entity';
import { BookingStatus } from '../../common/enums/database.enums';

@Entity('amenity_bookings')
export class AmenityBooking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Amenity, (amenity) => amenity.bookings)
  @JoinColumn({ name: 'amenity_id' })
  amenity: Amenity;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'booking_date', type: 'date' })
  bookingDate: Date;

  @Column({ name: 'time_slot', length: 50, nullable: true })
  timeSlot: string;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ name: 'admin_response', type: 'text', nullable: true })
  adminResponse: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
