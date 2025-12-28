import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Request } from './request.entity';
import { User } from '../../users/entities/user.entity';

@Entity('request_notes')
export class RequestNote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Request, (req) => req.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: Request;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text')
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
