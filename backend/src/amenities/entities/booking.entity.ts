import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  amenityId: number;

  @Column()
  amenityName: string;

  @Column()
  bookingDate: string;

  @Column()
  timeSlot: string;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ nullable: true })
  adminResponse: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
