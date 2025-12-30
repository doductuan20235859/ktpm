import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceItemsFeeType } from '../../common/enums/database.enums';

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Invoice, (inv) => inv.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

    // Nếu vẫn muốn truy cập trực tiếp invoiceId dưới dạng number
  @Column({ name: 'invoice_id', type: 'integer' })
  invoiceId: number;

  @Column({ name: 'fee_type', type: 'enum', enum: InvoiceItemsFeeType })
  feeType: InvoiceItemsFeeType;

  @Column({ type: 'character varying', length: 255, nullable: true })
  description: string;

@Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : 0),
    },
  })
  amount: number;
}