import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceFee } from '../../common/enums/database.enums';

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Invoice, (inv) => inv.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ name: 'fee_type', type: 'enum', enum: InvoiceFee })
  feeType: InvoiceFee;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;
}
