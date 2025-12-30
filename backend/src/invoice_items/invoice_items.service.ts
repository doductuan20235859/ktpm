import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InvoiceItem } from './entities/invoice_item.entity';
import { CreateInvoiceDto } from '../invoices/dto/create-invoice.dto';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Apartment } from '../apartments/entities/apartment.entity';

@Injectable()
export class InvoiceItemsService {
  constructor(
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
  ) {}

  /**
   * Lấy danh sách các khoản mục hóa đơn dựa trên mã căn hộ
   * @param apartmentCode Mã của căn hộ (ví dụ: 'A101')
   */
  async findByApartmentCode(apartmentCode: string): Promise<InvoiceItem[]> {
    try {
      // Sử dụng QueryBuilder để join qua bảng Invoice và Apartment
      const items = await this.invoiceItemRepository
        .createQueryBuilder('item')
        .leftJoinAndSelect('item.invoice', 'invoice') // Nối bảng Invoice
        .leftJoinAndSelect('invoice.apartment', 'apartment') // Nối bảng Apartment
        .where('apartment.code = :code', { code: apartmentCode }) // Lọc theo mã căn hộ
        .getMany();

      if (!items || items.length === 0) {
        throw new NotFoundException(`Không tìm thấy dịch vụ nào cho căn hộ ${apartmentCode}`);
      }

      return items;
    } catch (error) {
      throw new Error(`Lỗi khi lấy dữ liệu: ${error.message}`);
    }
  }
}