import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column('text')
  message: string;

  @Column({ length: 50, nullable: true })
  type: string;

  @Column({ name: 'target_audience', length: 50, default: 'ALL' })
  targetAudience: string;

  // Mảng ID của user/building (Postgres Array)
  @Column('int', { array: true, name: 'target_ids', nullable: true })
  targetIds: number[];

  @ManyToOne(() => User, (user) => user.createdNotifications, {
    nullable: true,
  })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
