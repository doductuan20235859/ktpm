import { Controller, Get, Param, HttpStatus, HttpException } from '@nestjs/common';
import { InvoiceItemsService } from './invoice_items.service';
import { InvoiceItem } from './entities/invoice_item.entity';

@Controller('invoice_items') // Đường dẫn gốc: http://localhost:3001/invoice_items
export class InvoiceItemsController {
  constructor(private readonly invoiceItemsService: InvoiceItemsService) {}

  /**
   * Endpoint: GET /invoice_items/apartment/:code
   * Ví dụ: http://localhost:3001/invoice_items/apartment/A-101
   */
  @Get('apartment/:code')
  async findByApartment(@Param('code') code: string): Promise<InvoiceItem[]> {
    try {
      const result = await this.invoiceItemsService.findByApartmentCode(code);
      return result;
    } catch (error) {
      // Nếu Service ném ra NotFoundException, Controller sẽ bắt lại và trả về lỗi phù hợp
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: error.message || 'Không tìm thấy dữ liệu cho căn hộ này',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}