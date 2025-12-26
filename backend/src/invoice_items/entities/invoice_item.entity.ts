import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Invoice } from '../../invoices/entities/invoice.entity';// Import entity Invoice của bạn

export enum InvoiceItemsFeeType {
  MANAGEMENT = 'MANAGEMENT',
  PARKING = 'PARKING',
  WATER = 'WATER',
  SERVICE = 'SERVICE',
  ELECTRIC = 'ELECTRIC',
  INTERNET = 'INTERNET',
  OTHER = 'OTHER',
}

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  // Thay vì @Column đơn thuần, ta dùng quan hệ ManyToOne
  @ManyToOne(() => Invoice, (invoice) => invoice.items, {
    onDelete: 'CASCADE', // Tùy chọn: Xóa invoice thì xóa luôn item
  })
  @JoinColumn({ name: 'invoice_id' }) // Chỉ định tên cột trong DB là invoice_id
  invoice: Invoice;

  // Nếu vẫn muốn truy cập trực tiếp invoiceId dưới dạng number
  @Column({ name: 'invoice_id', type: 'integer' })
  invoiceId: number;

  @Column({
    name: 'fee_type',
    type: 'enum',
    enum: InvoiceItemsFeeType,
  })
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