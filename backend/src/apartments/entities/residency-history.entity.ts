import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Apartment } from './apartment.entity';

@Entity('residency_history')
export class ResidencyHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Apartment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'apartment_id' })
  apartment: Apartment;

  @Column({ name: 'event_name', length: 100, nullable: true })
  eventName: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ name: 'event_date', type: 'date', default: () => 'CURRENT_DATE' })
  eventDate: Date;
}
