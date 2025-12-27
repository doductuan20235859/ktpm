// invoices.controller.ts
import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Controller('invoices') // Đường dẫn API: /invoices
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  async getAllInvoices() {
    const data = await this.invoicesService.findAll();
    return {
      success: true,
      data: data,
    };
  }

  @Get('apartment/:code')
  async getByApartmentCode(@Param('code') code: string) {
    return await this.invoicesService.findByApartmentCode(code);
  }
@Patch(':id/pay')
  async updatePaidAmount(
  @Param('id') id: string,
  @Body() updateInvoiceDto: UpdateInvoiceDto // Sử dụng DTO ở đây
) {
  console.log('Dữ liệu đã qua bộ lọc:', updateInvoiceDto);
 return await this.invoicesService.updatePaidAmount(
    id, 
    updateInvoiceDto.paidAmount
  );
}
}