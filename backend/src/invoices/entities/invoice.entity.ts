import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Apartment } from '../../apartments/entities/apartment.entity';
import { InvoiceStatus } from '../../common/enums/database.enums';
import { InvoiceItem } from './invoice-item.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'invoice_code', length: 50, unique: true, nullable: true })
  invoiceCode: string;

  @ManyToOne(() => Apartment, (apt) => apt.invoices)
  @JoinColumn({ name: 'apartment_id' })
  apartment: Apartment;

  @Column({ name: 'period_date', type: 'date' })
  periodDate: Date;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column('decimal', {
    name: 'total_amount',
    precision: 15,
    scale: 2,
    default: 0,
  })
  totalAmount: number;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.UNPAID })
  status: InvoiceStatus;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];
}
