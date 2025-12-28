import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { AmenityStatus } from '../../common/enums/database.enums';
import { AmenityBooking } from './amenity-booking.entity';

@Entity('amenities')
export class Amenity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @Column({ name: 'opening_time', type: 'time', nullable: true })
  openingTime: string;

  @Column({ name: 'closing_time', type: 'time', nullable: true })
  closingTime: string;

  @Column({ name: 'max_capacity', nullable: true })
  maxCapacity: number;

  @Column({ name: 'max_duration_minutes', default: 120 })
  maxDurationMinutes: number;

  @Column({ name: 'max_bookings_per_month', default: 10 })
  maxBookingsPerMonth: number;

  @Column({ name: 'requires_approval', default: true })
  requiresApproval: boolean;

  @Column({ type: 'enum', enum: AmenityStatus, default: AmenityStatus.ACTIVE })
  status: AmenityStatus;

  // Postgres Array Type
  @Column('text', { array: true, nullable: true })
  rules: string[];

  @Column('text', { array: true, name: 'booking_slots', nullable: true })
  bookingSlots: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => AmenityBooking, (booking) => booking.amenity)
  bookings: AmenityBooking[];
}
