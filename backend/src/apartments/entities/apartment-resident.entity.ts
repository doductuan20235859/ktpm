import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Apartment } from './apartment.entity';
import { User } from '../../users/entities/user.entity';
import { ResidentRole } from '../../common/enums/database.enums';

@Entity('apartment_residents')
export class ApartmentResident {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'apartment_id' })
  apartmentId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Apartment, (apt) => apt.residents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'apartment_id' })
  apartment: Apartment;

  @ManyToOne(() => User, (user) => user.residents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ResidentRole, default: ResidentRole.MEMBER })
  role: ResidentRole;

  @Column({ name: 'join_date', type: 'date', default: () => 'CURRENT_DATE' })
  joinDate: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
