// invoices.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Apartment } from '../apartments/entities/apartment.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceItem } from './entities/invoice-item.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Apartment)
    private apartmentRepository: Repository<Apartment>,
    private dataSource: DataSource, // Dùng để quản lý Transaction
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

  
  async create(createInvoiceDto: CreateInvoiceDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    const generatedInvoiceCode = `INV-${createInvoiceDto.period}-${createInvoiceDto.building.replace(/Tòa\s+/i, '')}${createInvoiceDto.apartmentCode}`;
    try {
      // 1. Tìm Apartment dựa trên building và apartmentCode gửi từ Frontend
      const apartment = await this.apartmentRepository.findOne({
        where: { 
          code: `${createInvoiceDto.building.replace(/Tòa\s+/i, '')}-${createInvoiceDto.apartmentCode}`
        },
      });

      if (!apartment) {
        throw new NotFoundException(`Không tìm thấy căn hộ ${createInvoiceDto.apartmentCode} thuộc ${createInvoiceDto.building}`);
      }

      // 2. Chuẩn bị dữ liệu Invoice
      // Chuyển đổi chuỗi "YYYY-MM" hoặc "YYYY-MM-DD" từ DTO sang kiểu Date cho Entity
      const invoice = queryRunner.manager.create(Invoice, {
        apartment: apartment,
        periodDate: new Date(createInvoiceDto.period), //"2024-05"
        dueDate: new Date(createInvoiceDto.dueDate),
        notes: createInvoiceDto.notes,
        totalAmount: createInvoiceDto.totalAmount,
        paidAmount: createInvoiceDto.paidAmount || 0,
        // InvoiceCode bạn có thể tự sinh hoặc để null nếu DB tự sinh
        invoiceCode: `INV-${createInvoiceDto.period}-${createInvoiceDto.building.replace(/Tòa\s+/i, '')}${createInvoiceDto.apartmentCode}`,
        createdAt: new Date(),
        // Gán mảng items trực tiếp vào đây nhờ cascade: true
        items: createInvoiceDto.items.map((item) => ({
          ...item,
          feeType: item.feeType as any,
        })),
      });

      // 3. Lưu Invoice chính
      const savedInvoice = await queryRunner.manager.save(invoice);

      await queryRunner.commitTransaction();

    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err.code === '23505') {
    throw new ConflictException(
      `Mã hóa đơn ${generatedInvoiceCode} đã tồn tại. Vui lòng kiểm tra lại kỳ thanh toán!`
    );
  }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  
}