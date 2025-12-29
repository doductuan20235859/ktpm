import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceStatus } from '../common/enums/database.enums';
import { Apartment } from '../apartments/entities/apartment.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(Apartment)
    private apartmentsRepository: Repository<Apartment>,
  ) {}

  // 1. Tạo hóa đơn mới (Dành cho Admin hoặc Test data)
  async create(createInvoiceDto: CreateInvoiceDto) {
    const { apartmentId, items, ...invoiceData } = createInvoiceDto;

    // Tính tổng tiền từ các items
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    // Tạo mã hóa đơn tự động (VD: INV-TIMESTAMP)
    const invoiceCode = `INV-${Date.now()}`;

    const newInvoice = this.invoicesRepository.create({
      ...invoiceData,
      invoiceCode,
      totalAmount,
      paidAmount: 0,
      status: InvoiceStatus.UNPAID,
      apartment: { id: apartmentId } as Apartment,
      items: items, // TypeORM sẽ tự động map sang InvoiceItem entity nhờ cascade: true
    });

    return await this.invoicesRepository.save(newInvoice);
  }

  // 2. Lấy danh sách hóa đơn của 1 căn hộ (Dành cho Resident)
  async findAllByApartment(apartmentId: number) {
    return await this.invoicesRepository.find({
      where: { apartment: { id: apartmentId } },
      relations: ['items', 'apartment'], // Lấy kèm chi tiết items và thông tin căn hộ
      order: { periodDate: 'DESC' }, // Mới nhất lên đầu
    });
  }

  // 3. Lấy chi tiết 1 hóa đơn
  async findOne(id: number) {
    const invoice = await this.invoicesRepository.findOne({
      where: { id },
      relations: ['items', 'apartment'],
    });
    if (!invoice) throw new NotFoundException(`Không tìm thấy hóa đơn #${id}`);
    return invoice;
  }
}
