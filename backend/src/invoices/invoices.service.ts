// invoices.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    @InjectRepository(InvoiceItem)
    private invoiceItemRepository: Repository<InvoiceItem>,
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
      .leftJoinAndSelect('invoice.items', 'items') // Lấy các hạng mục phí (nếu cần)
      .where('apartment.code = :code', { code }) // Lọc theo mã căn hộ
      .getMany();

    if (!invoices || invoices.length === 0) {
      throw new NotFoundException(
        `Không tìm thấy hóa đơn nào cho căn hộ ${code}`,
      );
    }

    return invoices;
  }

  async updatePaidAmount(id: string, paidAmount: number): Promise<Invoice> {
    // 1. Tìm hóa đơn theo ID
    // Dùng parseInt vì ID từ Param thường là string, nhưng DB thường là number
    const invoice = await this.invoiceRepository.findOne({
      where: { id: parseInt(id) },
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

    try {
      // 1. Tìm Apartment dựa trên building và apartmentCode gửi từ Frontend
      // Logic xử lý chuỗi: xóa chữ "Tòa " và nối chuỗi mã căn hộ
      const apartmentCodeSearch = `${createInvoiceDto.building.replace(/Tòa\s+/i, '')}-${createInvoiceDto.apartmentCode}`;

      const apartment = await this.apartmentRepository.findOne({
        where: {
          code: apartmentCodeSearch,
        },
      });

      if (!apartment) {
        throw new NotFoundException(
          `Không tìm thấy căn hộ ${createInvoiceDto.apartmentCode} thuộc ${createInvoiceDto.building}`,
        );
      }

      // 2. Chuẩn bị dữ liệu Invoice
      // Tạo mã hóa đơn (Vẫn giữ logic tạo mã để lưu vào DB)
      const invoiceCodeStr = `INV-${createInvoiceDto.period}-${createInvoiceDto.building.replace(/Tòa\s+/i, '')}${createInvoiceDto.apartmentCode}`;

      const invoice = queryRunner.manager.create(Invoice, {
        apartment: apartment,
        periodDate: new Date(createInvoiceDto.period),
        dueDate: new Date(createInvoiceDto.dueDate),
        notes: createInvoiceDto.notes,
        totalAmount: createInvoiceDto.totalAmount,
        paidAmount: createInvoiceDto.paidAmount || 0,
        invoiceCode: invoiceCodeStr,
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
      return savedInvoice; // Trả về kết quả sau khi lưu thành công
    } catch (err) {
      // Nếu có lỗi, rollback lại transaction
      await queryRunner.rollbackTransaction();

      // ĐÃ XÓA: Đoạn check if (err.code === '23505') throw ConflictException...

      // Ném lỗi gốc ra ngoài (NestJS sẽ xử lý thành Internal Server Error hoặc lỗi tương ứng của DB)
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ================= FINANCIAL SUMMARY =================
  async getFinancialSummary() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Sum totalAmount and paidAmount for current month
    const invoiceSums = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('COALESCE(SUM(invoice.total_amount), 0)', 'totalExpected')
      .addSelect('COALESCE(SUM(invoice.paid_amount), 0)', 'totalRevenue')
      .where('invoice.period_date BETWEEN :start AND :end', {
        start: startOfMonth.toISOString().split('T')[0],
        end: endOfMonth.toISOString().split('T')[0],
      })
      .getRawOne();

    const totalExpected = parseFloat(
      invoiceSums.totalexpected ?? invoiceSums.totalExpected ?? 0,
    );
    const totalRevenue = parseFloat(
      invoiceSums.totalrevenue ?? invoiceSums.totalRevenue ?? 0,
    );

    // Debtor count: invoices in period with paid_amount < total_amount
    const debtorCount = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.period_date BETWEEN :start AND :end', {
        start: startOfMonth.toISOString().split('T')[0],
        end: endOfMonth.toISOString().split('T')[0],
      })
      .andWhere('invoice.paid_amount < invoice.total_amount')
      .getCount();

    const collectionRate =
      totalExpected > 0 ? (totalRevenue / totalExpected) * 100 : 0;

    // Revenue by fee type
    const feeRows: { feeType: string; amount: string }[] =
      await this.invoiceItemRepository
        .createQueryBuilder('item')
        .leftJoin('item.invoice', 'invoice')
        .select('item.fee_type', 'feeType')
        .addSelect('COALESCE(SUM(item.amount), 0)', 'amount')
        .where('invoice.period_date BETWEEN :start AND :end', {
          start: startOfMonth.toISOString().split('T')[0],
          end: endOfMonth.toISOString().split('T')[0],
        })
        .groupBy('item.fee_type')
        .getRawMany();

    const revenueByFeeType = feeRows.map((r) => ({
      // Some DBs return aliased fields in lowercase keys; be defensive and use a safe cast
      name: (r as any).feetype ?? r.feeType,
      amount: parseFloat(((r as any).amount ?? 0) as any) || 0,
    }));

    // If the current-month data is all zeros, fall back to all-time aggregation
    const allZeroMonth =
      totalExpected === 0 &&
      totalRevenue === 0 &&
      debtorCount === 0 &&
      revenueByFeeType.every((r) => r.amount === 0);

    if (allZeroMonth) {
      // Compute all-time sums
      const allInvoiceSums = await this.invoiceRepository
        .createQueryBuilder('invoice')
        .select('COALESCE(SUM(invoice.total_amount), 0)', 'totalExpected')
        .addSelect('COALESCE(SUM(invoice.paid_amount), 0)', 'totalRevenue')
        .getRawOne();

      const allTotalExpected = parseFloat(
        allInvoiceSums.totalexpected ?? allInvoiceSums.totalExpected ?? 0,
      );
      const allTotalRevenue = parseFloat(
        allInvoiceSums.totalrevenue ?? allInvoiceSums.totalRevenue ?? 0,
      );

      const allDebtorCount = await this.invoiceRepository
        .createQueryBuilder('invoice')
        .where('invoice.paid_amount < invoice.total_amount')
        .getCount();

      const allFeeRows: { feeType: string; amount: string }[] =
        await this.invoiceItemRepository
          .createQueryBuilder('item')
          .select('item.fee_type', 'feeType')
          .addSelect('COALESCE(SUM(item.amount), 0)', 'amount')
          .groupBy('item.fee_type')
          .getRawMany();

      const allRevenueByFeeType = allFeeRows.map((r) => ({
        name: (r as any).feetype ?? r.feeType,
        amount: parseFloat(((r as any).amount ?? 0) as any) || 0,
      }));

      const allCollectionRate =
        allTotalExpected > 0 ? (allTotalRevenue / allTotalExpected) * 100 : 0;

      return {
        financialStats: {
          totalRevenue: allTotalRevenue,
          debtorCount: allDebtorCount,
          collectionRate: Number(allCollectionRate.toFixed(2)),
          totalExpected: allTotalExpected,
        },
        revenueByFeeType: allRevenueByFeeType,
        period: 'all_time',
      };
    }

    return {
      financialStats: {
        totalRevenue,
        debtorCount,
        collectionRate: Number(collectionRate.toFixed(2)),
        totalExpected,
      },
      revenueByFeeType,
      period: 'current_month',
    };
  }
  async findAllByApartment(apartmentId: number) {
    return await this.invoiceRepository.find({
      where: { apartment: { id: apartmentId } },
      relations: ['items', 'apartment'], // Lấy kèm chi tiết items và thông tin căn hộ
      order: { periodDate: 'DESC' }, // Mới nhất lên đầu
    });
  }
}
