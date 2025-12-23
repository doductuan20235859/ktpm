// invoices.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
  ) {}

  // Hàm lấy tất cả hóa đơn
  findAll(): Promise<Invoice[]> {
    return this.invoiceRepository.find({
  relations: ['apartment'], // Thêm dòng này để lấy thông tin căn hộ
});
  }
}