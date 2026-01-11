// invoices.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
    @Body() updateInvoiceDto: UpdateInvoiceDto, // Sử dụng DTO ở đây
  ) {
    console.log('Dữ liệu đã qua bộ lọc:', updateInvoiceDto);
    return await this.invoicesService.updatePaidAmount(
      id,
      updateInvoiceDto.paidAmount,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get('my-invoices')
  findMyInvoices(@Req() req) {
    const apartmentId = req.user.apartmentId;
    if (!apartmentId) {
      // Trường hợp user không gắn với căn hộ nào
      return [];
    }
    return this.invoicesService.findAllByApartment(apartmentId);
  }
  @Post()
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    console.log('Dữ liệu tạo hóa đơn nhận được:', createInvoiceDto);

    // Gọi sang service để thực hiện lưu vào Database
    const newInvoice = await this.invoicesService.create(createInvoiceDto);

    return {
      success: true,
      message: 'Tạo hóa đơn thành công',
      data: createInvoiceDto,
    };
  }
  // Summary used by admin dashboard
  @Get('summary')
  async summary() {
    return await this.invoicesService.getFinancialSummary();
  }
}
