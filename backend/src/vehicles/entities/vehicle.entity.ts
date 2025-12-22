import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Apartment } from '../../apartments/entities/apartment.entity';
import { VehicleType, VehicleStatus } from '../../common/enums/database.enums';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.vehicles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Apartment, (apt) => apt.vehicles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'apartment_id' })
  apartment: Apartment;

  @Column({ type: 'enum', enum: VehicleType })
  type: VehicleType;

  @Column({ length: 50, nullable: true })
  brand: string;

  @Column({ name: 'plate_number', length: 20, unique: true })
  plateNumber: string;

  @Column({ length: 30, nullable: true })
  color: string;

  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl: string;

  @Column({ name: 'registration_doc_url', type: 'text', nullable: true })
  registrationDocUrl: string;

  @Column({ type: 'enum', enum: VehicleStatus, default: VehicleStatus.PENDING })
  status: VehicleStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
