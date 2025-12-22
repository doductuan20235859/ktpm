import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Apartment } from '../../apartments/entities/apartment.entity';
import {
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from '../../common/enums/database.enums';
import { RequestNote } from './request-note.entity';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ticket_code', length: 50, unique: true, nullable: true })
  ticketCode: string;

  @Column({ length: 200 })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @ManyToOne(() => Apartment, (apt) => apt.requests, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'apartment_id' })
  apartment: Apartment;

  // Người tạo
  @ManyToOne(() => User, (user) => user.createdRequests)
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy: User;

  // Người xử lý (Nhân viên)
  @ManyToOne(() => User, (user) => user.assignedRequests, { nullable: true })
  @JoinColumn({ name: 'assigned_to_user_id' })
  assignedTo: User;

  @Column({ type: 'enum', enum: RequestCategory })
  category: RequestCategory;

  @Column({
    type: 'enum',
    enum: RequestPriority,
    default: RequestPriority.NORMAL,
  })
  priority: RequestPriority;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.NEW })
  status: RequestStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => RequestNote, (note) => note.request)
  notes: RequestNote[];
}
