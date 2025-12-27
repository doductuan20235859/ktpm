// invoices.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
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
  relations: {
      apartment: true,
      items: true,
      // Nếu muốn lấy thêm thông tin lồng trong items:
      // items: { someOtherRelation: true } 
    },
});
  }

  async findByApartmentCode(code: string): Promise<Invoice[]> {
    const invoices = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.apartment', 'apartment') // Lấy thông tin căn hộ
      .leftJoinAndSelect('invoice.items', 'items')       // Lấy các hạng mục phí (nếu cần)
      .where('apartment.code = :code', { code }) // Lọc theo mã căn hộ
      .getMany();

    if (!invoices || invoices.length === 0) {
      throw new NotFoundException(`Không tìm thấy hóa đơn nào cho căn hộ ${code}`);
    }

    return invoices;
  }

  async updatePaidAmount(id: string, paidAmount: number): Promise<Invoice> {
    // 1. Tìm hóa đơn theo ID
    // Dùng parseInt vì ID từ Param thường là string, nhưng DB thường là number
    const invoice = await this.invoiceRepository.findOne({ 
      where: { id: parseInt(id) } 
    });

    // 2. Nếu không tìm thấy, ném lỗi 404 để Backend phản hồi lại cho Frontend
    if (!invoice) {
      throw new NotFoundException(`Không tìm thấy hóa đơn với ID: ${id}`);
    }

    // 3. Cập nhật giá trị paidAmount
    // Bạn có thể chọn logic: Gán đè (invoice.paidAmount = paidAmount)
    // Hoặc Cộng dồn (invoice.paidAmount += paidAmount)
    invoice.paidAmount = paidAmount;

    // 4. Lưu lại bản ghi đã cập nhật vào Database
    return await this.invoiceRepository.save(invoice);
  }
}